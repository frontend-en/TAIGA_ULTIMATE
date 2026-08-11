---
name: yookassa-site-compliance
description: Implement or audit the Next.js App Router frontend for a public YooKassa-ready digital service. Use when building pricing, legal, contacts, how-it-works, SEO, responsive navigation, or YooKassa checkout UI with RU/EN localization and compliant public business data.
---

# YooKassa App Router Frontend

Build the public frontend for this repository's Next.js App Router site. Preserve the existing light/dark themes, responsive design system, reusable UI primitives, and `next-intl` RU/EN routing. Treat current official YooKassa documentation as the source of truth, not copied snippets or assumptions.

## Delivery gates

Before publishing or inventing legal text, collect and confirm:

- production domain;
- seller's full legal name, INN, OGRNIP/OGRN when applicable, and requisites address;
- working support email and phone; messenger contact only when operational;
- product description, package names, credit quantities, fixed RUB prices, and delivery moment;
- approved offer wording, refund policy, privacy-processing details, and offer effective date;
- applicable receipt configuration: item description, VAT code, payment mode, and payment subject.

Do not invent, infer, mask with placeholders, or publish any missing fact. Stop release work, report missing owner data, and omit it from public output. Do not describe an internal balance as electronic money or promise transfer, withdrawal, exchange, investment returns, or functionality the service does not provide.

## Required research

Read the current repository instructions, `CODE_RULES.md`, `README.md`, `app/[locale]`, `components/layout`, `components/landing`, and both locale message files. Use App Router patterns; do not use a Pages Router rule as architecture guidance.

Browse and cite current official YooKassa sources before making payment decisions:

- `https://yookassa.ru/developers/payment-acceptance/integration-scenarios/widget/integration`;
- linked payment lifecycle and incoming-notification documentation;
- `https://yookassa.ru/developers/payment-acceptance/after-the-payment/refunds`;
- `https://yookassa.ru/developers/payment-acceptance/receipts/54fz/yoomoney/basics`.

## Orchestration: required calls

For a multi-file frontend task, use native Codex collaboration rather than tmux or external CLI workers. Maintain one active implementation owner at a time to avoid write conflicts.

1. Call `update_plan` with discovery, implementation, verification, and review steps.
2. Call `collaboration.spawn_agent` for a read-only `fullstack-developer` audit. Prompt it to map routes, components, messages, metadata, existing fake contact paths, and blockers. Explicitly forbid writes and reverts.
3. Incorporate the audit and owner-provided data into the plan. If mandatory public data is missing, stop before implementation and request it.
4. Call `collaboration.spawn_agent` for `fullstack-developer` implementation. Give it exclusive ownership of the target route, layout, component, config, and translation files. Tell it that other agents share the repository, it must preserve unrelated changes, use `apply_patch`, and run its scoped checks.
5. After implementation completes, call `collaboration.spawn_agent` with `code-review-pro` for an independent review. Give it the changed-file scope; do not let the implementing agent approve its own work.
6. Resolve actionable review findings. Then run `npm run type-check`, `npm run build`, and a mobile/desktop browser check with the available web-app testing capability.

Use this task split for the current public-site conversion:

| Stage | Agent and ownership | Required result |
| --- | --- | --- |
| Discovery | `fullstack-developer`, read-only | Route map, data gaps, fake UI/metadata findings |
| Implementation | `fullstack-developer`, exclusive writer | App Router pages, shared frontend components, `lib/site` configs, translations, metadata, sitemap |
| Review | `code-review-pro`, read-only | Defects in routes, links, i18n, accessibility, mobile behavior, legal-data safety |
| Browser QA | Main agent or web tester, read-only | Evidence for RU/EN routes, theme, navigation, 320 px mobile layout |

Keep plans and task prompts specific. Include absolute repository paths and file ownership; never ask two agents to modify the same file concurrently.

## Frontend architecture

Use Server Components by default. Add `'use client'` only for localized interactive behavior such as the mobile menu, theme switcher, or payment UI. Do not put secrets, payment validation, or fulfillment logic in Client Components.

Build locale routes beneath `app/[locale]/` and use `params: Promise<{ locale: string }>` consistently. Reuse `Header`, `Footer`, theme provider, language switcher, and UI components. Keep visible strings in `messages/ru.json` and `messages/en.json`; do not hardcode public text in TSX.

Use typed, single-source config modules such as:

```text
lib/site/business.ts   # seller, contacts, domain readiness
lib/site/pricing.ts    # fixed package catalogue in RUB
lib/site/legal.ts      # owner-approved legal content only
```

Do not duplicate contacts, requisites, package amounts, or legal wording in route components. Keep missing owner data as an unpublished configuration state; do not render public placeholders.

For the current product shape, implement public, unauthenticated pages for each locale:

```text
/pricing        # package price, credits, and clear purchase rules
/how-it-works   # package -> YooKassa -> confirmed payment -> crediting -> AI functions
/offer          # owner-approved public offer
/refunds        # owner-approved refund policy
/privacy        # personal-data policy
/requisites     # seller details and contacts
```

Use a shared `LegalPage` or equivalent presentational template when it reduces duplication without hiding page semantics. Each route has one `h1`, meaningful headings, keyboard-accessible links, and responsive spacing.

## Navigation, content, and SEO

Add Header and Footer links for pricing, offer, refunds, privacy, requisites, and contacts. Make every footer legal link available without authentication. Update all CTA paths to pricing or a real configured contact channel.

Remove a nonfunctional lead form unless a real validated submission endpoint exists. Never display success before the service responds successfully. Remove test phone, messenger links, and unverified social profiles.

Implement per-route metadata with `generateMetadata` or a reusable server helper. Emit canonical URLs, Open Graph URLs, JSON-LD URLs, `robots`, and `sitemap` entries only from a confirmed `https` production origin; do not guess a domain. Include RU/EN alternates when both production URLs are known.

## Checkout boundary

This skill owns the checkout UI and truthful state messaging, not unsecured payment processing. Keep `shopId`, secret keys, webhook secrets, and receipt credentials server-only and out of the repository, browser bundle, logs, metadata, and error messages.

Use server-controlled package IDs, amounts, and receipt data. A checkout UI may start a payment only through a server-side handler; never trust client-supplied price or credits. A YooKassa widget needs a payment page or approved popup flow, a container at least 288 px wide, and a fresh confirmation token per payment.

Do not credit balance, unlock AI access, or show paid status because the customer visits `return_url`. The backend must verify the terminal status through YooKassa notification processing or a server-side status request; notification handling must be idempotent. Render a neutral, truthful pending state until confirmation is complete.

## Release checklist

Verify:

- all RU/EN routes load, links resolve, translations exist, and Header/Footer work at desktop and 320 px widths;
- theme switching, focus states, semantics, contrast, keyboard navigation, and reduced-motion behavior remain sound;
- every published price, contact, requisites field, legal text, and delivery statement is approved and matches the typed config;
- no fake contacts, fake submit success, placeholders, guessed URLs, secrets, or unsupported balance claims remain;
- pricing, offer, checkout description, receipt data, and delivered access describe the same actual product;
- `npm run type-check` and `npm run build` pass;
- independent review findings and browser-QA evidence are included in the final report.

Report changed files, public URLs, tests, review evidence, and owner decisions still blocking publication.
