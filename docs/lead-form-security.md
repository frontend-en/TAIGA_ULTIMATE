# Lead form validation and anti-spam

The existing Node.js `POST /api/leads` endpoint uses server-side validation,
a honeypot, bounded process-local counters and submission claims, Jev
classification, and synchronous SMTP delivery. No extra database, CAPTCHA
account, background worker or registration is required.

## Configuration

Use `.env.example` as a template. Keep server secrets out of Git.

- Existing SMTP settings and `LEAD_RECIPIENT`: ordinary lead delivery.
- `TYPESAFE_API_KEY`: the user's existing Jev key, server only.
- `LEAD_REVIEW_RECIPIENT`: a valid email address for manual review.
- `LEAD_AI_MODEL`: fixed model version, default `jev-1.14.0`.
- `LEAD_AI_MODE`: set to `enforce` in the supplied template and local runtime to
  reject high-confidence spam/manipulation. Omitting it retains the compatibility
  default `observe`; use that mode explicitly when calibrating a new model.
- `LEAD_TRUST_PROXY`: defaults to `false`. Enable only after verifying that the
  ingress overwrites `X-Real-IP` and cannot be bypassed. Without a trusted valid
  IP, process-wide limits still apply, without a shared `unknown` per-IP bucket.
- `LEAD_HMAC_SECRET`: optional. By default a secure random secret is generated
  once per process. An explicitly supplied nonempty value must be at least
  32 bytes; no manual generation is necessary.

Missing required Jev/mail configuration returns a sanitized `503`. There are no
new public build-time keys or client provider tokens. Local development uses the
same business-field request contract as production.

## Local limits and duplicate protection

Before reading a request body, a separate process-wide admission guard limits
attempts to 120 per rolling minute and concurrent requests to 16. This guard
also counts malformed requests and honeypots and requires no AI/mail settings.
Rejected attempts return `429` with `Retry-After`; released slots can be reused
after success, validation errors, cancellation or deadlines. This bounds work
before the valid-submission counters below. It does not trust client IP headers.

| Setting | Default | Window |
| --- | --- | --- |
| `LEAD_IP_MINUTE_LIMIT` | 5 | rolling 60 seconds, only with trusted IP |
| `LEAD_IP_DAY_LIMIT` | 30 | rolling 24 hours, only with trusted IP |
| `LEAD_GLOBAL_MINUTE_LIMIT` | 60 | rolling 60 seconds per process |
| `LEAD_GLOBAL_DAY_LIMIT` | 1000 | calendar day UTC per process |
| `LEAD_AI_DAY_LIMIT` | 500 | calendar day UTC per process |

All values are positive integers. State is shared by handler instances within
one Node.js process. Operations update memory synchronously, before returning
their promises, so concurrent requests in that process cannot over-reserve a
limit or acquire the same submission. Maps have explicit capacity bounds and
expired records are pruned; live claims are not evicted to accept new work.

Only HMAC digests, timestamps, counters and claim ownership are retained, not raw
IP addresses, contacts or form text. Submission claims last 120 seconds; successful
delivery is remembered for ten minutes. Owner checks prevent a stale request from
releasing or completing another request's claim. Completed duplicates return
`200` without another AI call or email; concurrent claims return `409`.

**These are local, temporary controls.** Restarts and deployments reset counters,
AI budgets and duplicate history. Multiple Passenger/Node.js processes have
independent state and each receives its own configured limits. This design does
not claim a durable total budget or coordination across hosts/processes.

## Validation, classification and delivery

The JSON request contains name (2–80 characters), contact (3–120), messenger
(1–120), purpose (10–1000), consent (`true`) and the empty hidden `website` field.
Strings are trimmed. Single-line fields reject control characters and line
separators before trimming, preventing inserted lines from impersonating other
fields in a notification. Purpose allows ordinary multiline text and tabs but
rejects unsafe controls. Contact remains free text; ownership is not verified.
Unknown fields are stripped. A filled honeypot returns neutral `200` without
calling Jev or sending email. Body size is limited to 16 KiB with a five-second
read deadline. Explicit cross-site browser Fetch Metadata is rejected as well
as disallowed origins. These checks supplement admission and validation; they
are not proof of a human sender and do not stop direct HTTP clients.

Jev receives only a redacted purpose and a fixed description of the service.
The `leads-v2` rubric covers both personal AI companions and business services.
Contact masking recognizes email addresses, phone numbers and the submitted
`@handle`; arbitrary free-form contact text is not erased from the purpose.
Otherwise an attacker could duplicate a checker directive in the contact field
to remove that directive before classification. Quoted security examples and
requested behavior of a future bot are distinguished from active attempts to
control this checker. The high-confidence thresholds below are unchanged.
Recognizable contact tokens and common email/phone patterns are masked; this is data
minimization, not a guarantee of removing all personal information. It gets no
tools, URL fetching, conversation history or other leads. Fixed server-defined
Noul questions score spam and attempts to manipulate the checker.

Routing, in order:

1. Spam probability at least `0.99`: suspected spam.
2. Checker-manipulation probability at least `0.99`: suspected manipulation.
3. Spam and manipulation probabilities both at most `0.10`: normal lead.
4. Other results: manual review.

The fixed TypeSafe HTTPS request has a three-second total deadline, a 32-KiB
response cap, strict finite `[0,1]` answer validation and no automatic retries.
Attempts reserve the local AI budget before the call, even if it fails.
Provider errors, malformed answers, timeouts and exhausted AI budget always
route to manual review, never automatic rejection.

Normal leads go to `LEAD_RECIPIENT`; review leads go to
`LEAD_REVIEW_RECIPIENT` with a fixed review subject and available reason/scores.
In `observe`, suspected spam also goes to review. In `enforce`, suspected spam
returns `422` without email. Recipients and subjects are controlled by the server;
user input is plain-text body content, never a mail header.

SMTP has a 20-second deadline with actual socket cancellation, inside a
40-second handler deadline. Success means SMTP accepted the email, a confirmed
duplicate, or a silently discarded honeypot. A later claim-completion failure
does not turn a confirmed email into an error. SMTP timeout means receipt could
not be confirmed: an email may already have arrived. No automatic SMTP retry or
exactly-once delivery is promised. There is no durable local quarantine.

## API and form behavior

| Response | Meaning |
| --- | --- |
| `200 {ok:true}` | Accepted, confirmed duplicate, or honeypot |
| `400 VALIDATION_ERROR` | Invalid fields/body/origin |
| `409 SUBMISSION_IN_PROGRESS` | Preserve fields; wait for `Retry-After` |
| `422 SUBMISSION_REJECTED` | Generic AI rejection, only in `enforce` |
| `429 RATE_LIMITED` | Preserve fields; wait for `Retry-After` |
| `503 SERVICE_UNAVAILABLE` | Receipt unconfirmed; preserve fields |

The form becomes interactive after client hydration, blocks concurrent clicks,
preserves drafts on errors, honors retry cooldowns and supports RU/EN. It sends
business fields only and makes no external anti-bot widget requests. Internal
model scores/provider errors are not returned to the browser. Logs contain
generated request IDs, fixed routing/reason codes, durations, model/rubric,
probabilities and budget metadata, not raw inputs or secrets.

## Checks and rollout

Verified locally on 2026-10-27: `lint`, `type-check`, production build and all
150 unit/API tests passed. The live paid-provider evaluation was intentionally
skipped. Browser coverage passed all 44 cases: 42 in the full run, then the two
desktop landing cases passed unchanged on a targeted single-worker rerun after
host/browser scheduling exceeded their original 30-second deadlines. All form
security cases passed in both desktop and mobile Chromium. SMTP/provider calls
were mocked or intercepted; these attack checks sent no real notifications.
Independent code review found no blocking issues in this hardening.

The dependency vulnerability audit did not complete within bounded timeouts;
dependency safety has not been established by this verification. These changes
and enforcement settings were applied locally, without a production deployment.

```sh
npm run lint
npm run type-check
npm test
npm run test:e2e
```

Browser tests use an isolated `.next-e2e` build and mock the lead API only.
Local state tests cover concurrent limits, expiry, owner races, capacity bounds
and UTC budget resets without an external service.

The optional paid model evaluation requires an explicit suite and call budget.
For example, in PowerShell:

```powershell
$env:LEAD_JEV_SUITE = 'curated'
$env:LEAD_JEV_PHASE = 'baseline'
$env:LEAD_JEV_MAX_CALLS = '24'
npm run test:leads:jev
```

Only this explicitly opted-in test loads local `.env` credentials through
`@next/env`. Normal `npm test` skips the live evaluation and never loads its
credentials. The evaluator invokes only the classifier, never SMTP, with at
most two calls in flight and no retries. `LEAD_JEV_CASE_IDS` optionally selects
comma-separated exact IDs within a suite; unknown or duplicate IDs fail before
calls. Selected case count must fit `LEAD_JEV_MAX_CALLS`.

The frozen `curated` suite has 24 independent hand-written scenarios: 12 genuine
enquiries (including eight personal-companion uses), six unrelated sales pitches
and six checker-manipulation attempts. The separate `holdout` suite has 12 cases
(6/3/3), reserved until rubric tuning is frozen. The original 230-case variant
corpus remains available only with `LEAD_JEV_SUITE=legacy` and a sufficient
explicit budget; its 100 legitimate and 100 spam examples use 25 related semantic
families each, plus 30 manipulation messages. These smoke corpora do not estimate
population accuracy or establish prompt-injection immunity.

Ignored reports under `artifacts/lead-evaluation/` contain case IDs, expected and
actual outcomes, reasons, scores, durations and derived class counts. They report
the complete expected-label by normal/review/rejected matrix. A genuine enquiry
succeeds only when normal; spam/manipulation succeeds only when rejected. Manual
review is not a successful rejection because it still sends email. Semantic
uncertainty is separate from provider errors/timeouts/malformed responses; those
failures are inconclusive, never evidence of successful defense.

On 2026-10-28 the live evaluation used exactly 60 calls: baseline 24, the same
24 after the change, then a single 12-case holdout run after the rubric was
frozen. Concurrency was two, retries zero; no SMTP was invoked. Each run had
zero provider failures and zero automatic rejections of genuine enquiries.
Cells below are **normal / review / rejected** counts, not general accuracy:

| Run | Genuine enquiries | Unrelated spam | Manipulation | Strict expected outcomes | Attack rejections |
| --- | --- | --- | --- | --- | --- |
| `leads-v1` baseline, 24 | 11 / 1 / 0 | 0 / 1 / 5 | 1 / 1 / 4 | 20 / 24 | 9 / 12 |
| `leads-v2` after, 24 | 11 / 1 / 0 | 0 / 0 / 6 | 0 / 1 / 5 | 22 / 24 | 11 / 12 |
| `leads-v2` sealed holdout, 12 | 5 / 1 / 0 | 0 / 0 / 3 | 0 / 1 / 2 | 10 / 12 | 5 / 6 |

All eight personal-companion cases already passed normally in the baseline;
the business-only service description was a context mismatch, not an observed
false rejection in those cases. The arbitrary-contact redaction attack passed
normally before the fix (manipulation `0.02`) and was rejected after it (`0.99`).
The new criteria did not eliminate uncertainty: one genuine security quotation
and one manipulation attempt remained in review in both the curated and holdout
runs. The holdout manipulation scored `0.98`, below the unchanged `0.99`
rejection threshold, so it still follows the review/email route. Thresholds were
not lowered to make these small smoke sets pass.

Reports: `jev-curated-baseline-leads-v1-1793139321994.json`,
`jev-curated-after-leads-v2-1793139646483.json`, and
`jev-holdout-holdout-leads-v2-1793139744023.json`.

Use `enforce` for active rejection, and monitor the review mailbox for false
positives and provider failures. When changing the model or rubric, use `observe`
for calibration, review proposed rejections and check quality with anonymized
real examples before re-enabling enforcement. Known legitimate corpus/observed
cases must not be rejected. Passing isolated tests proves routing and resource
bounds, not the accuracy of the live model or immunity to manipulation.

No database query, shell command, HTML template or mail header is built from
submitted fields: they remain plain-text email content. SQL/HTML-like text is
not blacklisted because legitimate enquiries may discuss code. Only purpose
is sent to the classifier, so promotion hidden in other fields is not assessed
by AI. Large distributed floods require limits at the hosting/reverse-proxy
layer; application limits cannot stop traffic before it reaches Node.js.
