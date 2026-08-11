# YooKassa Legal Minimum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the obsolete arbitrary 1:1 balance top-up copy with one truthful fixed package of 100 internal AI credits for 600 RUB across the public RU/EN site.

**Architecture:** Keep the fixed package values in `lib/site/pricing.ts`, visible localized copy in both message files, and owner-approved legal wording in `lib/site/legal.ts`. Reuse the existing App Router pages and layouts; do not introduce payment creation, a widget, webhooks, fulfillment, or a homepage promotion.

**Tech Stack:** Next.js 15 App Router, TypeScript strict mode, next-intl RU/EN messages, Tailwind CSS, Playwright.

## Global Constraints

- The only package is 100 internal credits for 600 RUB, equivalent to 6 RUB per credit.
- Credits are usable only for AI features of an already connected bot and cannot be withdrawn, exchanged, transferred, invested, or used outside the service.
- Crediting is described as occurring only after server-side confirmation of a successful YooKassa payment; a return URL is never proof of payment.
- Refunds apply only when the service is unavailable for a reason attributable to the Provider and equal 6 RUB per unused credit, capped at the original 600 RUB payment.
- Offer and refund wording use the effective date 11 August 2026.
- Do not implement checkout, payment API routes, secrets, webhooks, payment status, automatic fulfillment, homepage pricing promotion, discounts, subscriptions, or additional packages.
- Do not invent receipt `payment_mode`, `payment_subject`, or a new VAT code.
- Preserve existing seller data, support contacts, light/dark themes, locale routing, and unrelated worktree changes.

---

## File Map

- `lib/site/pricing.ts`: typed, single source of truth for package ID, credits, price, effective rate, currency, and public product description.
- `app/[locale]/pricing/page.tsx`: render the existing legal-minimum pricing presentation from config and localized strings.
- `messages/ru.json`: Russian pricing, how-it-works, and FAQ copy.
- `messages/en.json`: matching English copy.
- `lib/site/legal.ts`: RU/EN offer and refund rules only; privacy and requisites stay unchanged.
- `tests/yookassa-legal-minimum.spec.ts`: focused browser assertions for package, legal terms, locale parity, and obsolete-copy removal.

### Task 1: Add failing public-contract tests

**Files:**
- Create: `tests/yookassa-legal-minimum.spec.ts`

**Interfaces:**
- Consumes: existing localized routes `/ru/pricing`, `/en/pricing`, `/ru/offer`, `/en/offer`, `/ru/refunds`, `/en/refunds`, `/ru/how-it-works`, and `/ru#faq`.
- Produces: executable public-copy contract that later tasks must satisfy.

- [ ] **Step 1: Create the focused Playwright specification**

```ts
import { expect, test } from 'playwright/test';

test.describe('YooKassa legal minimum', () => {
  test('publishes the fixed Russian package without obsolete top-up terms', async ({ page }) => {
    await page.goto('/ru/pricing');

    await expect(page.getByRole('heading', { level: 1, name: 'Пакет внутренних кредитов' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '100 внутренних кредитов' })).toBeVisible();
    await expect(page.getByText('600 ₽', { exact: true })).toBeVisible();
    await expect(page.getByText('6 ₽ за 1 внутренний кредит')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Минимальная сумма пополнения');
    await expect(page.locator('body')).not.toContainText('1 ₽ оплаты = 1 ₽ внутреннего баланса');
  });

  test('keeps the English package equivalent to the Russian package', async ({ page }) => {
    await page.goto('/en/pricing');

    await expect(page.getByRole('heading', { level: 1, name: 'Internal credit package' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '100 internal credits' })).toBeVisible();
    await expect(page.getByText('RUB 600', { exact: true })).toBeVisible();
    await expect(page.getByText('RUB 6 per internal credit')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('RUB 1 paid = RUB 1');
  });

  test('publishes the approved offer and refund calculation in both locales', async ({ page }) => {
    await page.goto('/ru/offer');
    await expect(page.getByText('100 внутренних кредитов за 600 ₽')).toBeVisible();
    await expect(page.getByText(/11 августа 2026/)).toBeVisible();
    await expect(page.locator('body')).not.toContainText('не менее 200 ₽');

    await page.goto('/ru/refunds');
    await expect(page.getByText(/6 ₽ за каждый неиспользованный внутренний кредит/)).toBeVisible();

    await page.goto('/en/offer');
    await expect(page.getByText('100 internal credits for RUB 600')).toBeVisible();

    await page.goto('/en/refunds');
    await expect(page.getByText(/RUB 6 for each unused internal credit/)).toBeVisible();
  });

  test('keeps explanatory pages consistent with the fixed package', async ({ page }) => {
    await page.goto('/ru/how-it-works');
    await expect(page.getByText('Выберите пакет из 100 внутренних кредитов за 600 ₽.')).toBeVisible();

    await page.goto('/ru#faq');
    await expect(page.getByText(/Пакет из 100 внутренних кредитов стоит 600 ₽/)).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Минимальное пополнение — 200 ₽');
  });
});
```

- [ ] **Step 2: Run the focused test to verify the old public contract fails**

Run: `npm run test:e2e -- tests/yookassa-legal-minimum.spec.ts`

Expected: FAIL because the current pages still publish a 200 RUB minimum and 1:1 balance rate.

- [ ] **Step 3: Commit the failing contract test**

```bash
git add tests/yookassa-legal-minimum.spec.ts
git commit -m "test: define fixed credit package contract"
```

### Task 2: Implement the fixed pricing package

**Files:**
- Modify: `lib/site/pricing.ts`
- Modify: `app/[locale]/pricing/page.tsx`
- Modify: `messages/ru.json`
- Modify: `messages/en.json`
- Test: `tests/yookassa-legal-minimum.spec.ts`

**Interfaces:**
- Produces: `pricing.packageId`, `pricing.credits`, `pricing.priceRub`, `pricing.rubPerCredit`, `pricing.currency`, and `pricing.publicProductDescription`.
- Consumes: next-intl namespace `pages.pricing` with `title`, `description`, `packageTitle`, `packagePrice`, `balanceDescription`, `facts.rate`, `facts.confirmation`, `facts.restrictions`, `facts.refund`, `paymentTitle`, `paymentDescription`, and `contactCta`.

- [ ] **Step 1: Replace arbitrary top-up configuration with the fixed package**

```ts
export const pricing = {
  packageId: 'ai-credits-100',
  credits: 100,
  priceRub: 600,
  rubPerCredit: 6,
  currency: 'RUB',
  publicProductDescription: 'Пакет доступа к AI-функциям подключённого бота: 100 внутренних кредитов',
  receipt: {
    vat: 'none',
  },
} as const;
```

Keep the existing `receipt.vat` value unchanged; do not add receipt subject or payment mode.

- [ ] **Step 2: Render package values through config on the pricing page**

Replace the `minimumTopUpRub` fact construction with localized interpolation from `pricing.credits`, `pricing.priceRub`, and `pricing.rubPerCredit`. Keep the existing support `mailto:` action and the existing two-card page structure.

```ts
const facts = [
  t('facts.rate', { rate: pricing.rubPerCredit }),
  t('facts.confirmation'),
  t('facts.restrictions'),
  t('facts.refund', { rate: pricing.rubPerCredit }),
];
```

Render the package heading and price inside the first card:

```tsx
<h2 className="font-display text-2xl font-semibold tracking-tight">
  {t('packageTitle', { credits: pricing.credits })}
</h2>
<p className="mt-2 text-3xl font-bold text-foreground">
  {t('packagePrice', { price: pricing.priceRub })}
</p>
```

- [ ] **Step 3: Replace the RU and EN pricing namespaces**

Use these exact semantic claims in both locales:

```json
{
  "ru": {
    "title": "Пакет внутренних кредитов",
    "packageTitle": "{credits} внутренних кредитов",
    "packagePrice": "{price} ₽",
    "rate": "{rate} ₽ за 1 внутренний кредит"
  },
  "en": {
    "title": "Internal credit package",
    "packageTitle": "{credits} internal credits",
    "packagePrice": "RUB {price}",
    "rate": "RUB {rate} per internal credit"
  }
}
```

The longer description and facts must state: connected-bot AI use only, crediting after confirmed successful payment, no withdrawal/exchange/transfer/outside use, and the approved conditional refund. The payment card must truthfully state that online checkout is not yet available and direct the customer to support.

- [ ] **Step 4: Run type checking and the pricing tests**

Run: `npm run type-check`

Expected: PASS.

Run: `npm run test:e2e -- tests/yookassa-legal-minimum.spec.ts --grep "package"`

Expected: the two pricing tests PASS; legal-consistency tests may still fail until Task 3.

- [ ] **Step 5: Commit fixed pricing**

```bash
git add lib/site/pricing.ts app/[locale]/pricing/page.tsx messages/ru.json messages/en.json
git commit -m "feat: publish fixed internal credit package"
```

### Task 3: Synchronize offer, refunds, how-it-works, and FAQ

**Files:**
- Modify: `lib/site/legal.ts`
- Modify: `messages/ru.json`
- Modify: `messages/en.json`
- Test: `tests/yookassa-legal-minimum.spec.ts`

**Interfaces:**
- Consumes: the fixed package contract from Task 2.
- Produces: consistent RU/EN public legal and explanatory copy with no obsolete arbitrary-top-up language.

- [ ] **Step 1: Update the RU and EN offer documents**

Set offer effective dates to `Дата вступления в силу: 11.08.2026` and `Effective date: 11 August 2026`.

Replace the subject, acceptance, pricing, access, and refund statements so they say:

```text
RU: Пользователь приобретает фиксированный пакет из 100 внутренних кредитов за 600 ₽.
EN: The User purchases a fixed package of 100 internal credits for RUB 600.
```

Preserve the existing seller identity, YooKassa/card-data statement, verified-payment rule, acceptable-use rules, privacy link, and contact details. Keep the restriction that internal credits are not money and cannot be transferred, withdrawn, exchanged, or used outside the service.

- [ ] **Step 2: Update the RU and EN refund documents**

Set refund effective dates to the same 11 August 2026 date. State all four approved constraints explicitly:

```text
1. The service must be unavailable for a reason attributable to the Provider.
2. Only unused internal credits qualify.
3. Refund = 6 RUB × unused credits.
4. Refund cannot exceed the original 600 RUB payment.
```

Keep the existing email request channel and payment/account identification requirement. Do not add an unapproved processing deadline.

- [ ] **Step 3: Update how-it-works and FAQ messages in both locales**

Change the first how-it-works step to select the fixed 100-credit/600-RUB package. Keep payment confirmation before crediting and explain that exactly 100 credits are credited. Replace the FAQ answer about ongoing AI charges with the fixed package and clarify that the package does not pay for bot development or initial connection.

- [ ] **Step 4: Search for obsolete public claims**

Run:

```bash
rg -n "200 ₽|RUB 200|1 ₽ оплаты|RUB 1 paid|minimumTopUpRub|creditingRate|самостоятельно выбирает сумму|independently selects a top-up" app components lib messages tests
```

Expected: no matches in public code or tests except explicit negative assertions in `tests/yookassa-legal-minimum.spec.ts`.

- [ ] **Step 5: Run the complete focused browser test**

Run: `npm run test:e2e -- tests/yookassa-legal-minimum.spec.ts`

Expected: PASS.

- [ ] **Step 6: Commit synchronized legal copy**

```bash
git add lib/site/legal.ts messages/ru.json messages/en.json tests/yookassa-legal-minimum.spec.ts
git commit -m "feat: align offer and refunds with credit package"
```

### Task 4: Verify release readiness for the scoped frontend change

**Files:**
- Verify only; modify scoped files only if a check reveals a defect.

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: type, test, build, localization, and browser evidence for independent review.

- [ ] **Step 1: Run static and automated checks**

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e -- tests/yookassa-legal-minimum.spec.ts
npm run build
```

Expected: every command exits with code 0.

- [ ] **Step 2: Perform browser QA**

Check `/ru/pricing`, `/en/pricing`, `/ru/offer`, `/en/offer`, `/ru/refunds`, `/en/refunds`, `/ru/how-it-works`, and `/ru#faq` at 1440 px and 320 px widths. Confirm one `h1`, readable package values, working footer/legal links, no horizontal overflow, keyboard-visible support link, and correct light/dark rendering.

- [ ] **Step 3: Perform the final scope audit**

Run `git diff --check` and `git status --short`. Confirm there are no checkout routes, widgets, webhook handlers, secrets, homepage pricing sections, or unrelated modifications.

- [ ] **Step 4: Request independent review**

The reviewer must verify fixed-package consistency, RU/EN parity, the refund calculation, obsolete-copy removal, truthful payment availability, and scope containment. Resolve every actionable finding before declaring completion.
