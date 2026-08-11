# YooKassa Legal Minimum Design

**Date:** 2026-08-11  
**Status:** Approved for implementation  
**Scope:** Public pricing and legal content only

## Goal

Make the public RU/EN site consistently describe one fixed digital-service package for future YooKassa acceptance without presenting a checkout flow that does not exist yet.

## Approved product

- Product: a package of 100 internal credits for AI features of an already connected bot.
- Customer price: 600 RUB.
- Effective purchase rate: 6 RUB per internal credit.
- Delivery: 100 credits are credited automatically only after the service receives server-side confirmation that the YooKassa payment succeeded.
- Restrictions: credits are not money, electronic money, a bank balance, an investment, or a payment instrument. They cannot be withdrawn, exchanged for money, transferred to another user, or used outside the service.
- Refund: if the service is unavailable for a reason attributable to the Provider, the customer may request a refund for the unused credits at 6 RUB per unused credit, up to the original payment amount.
- New legal-content effective date: 11 August 2026.

## Public-site changes

### Pricing

The localized `/pricing` page will show a single fixed package: **100 internal credits — 600 RUB**. It will explain what the credits buy, when they are credited, the usage restrictions, and the approved refund rule.

The page will not render a fake YooKassa widget or imply that online payment is active. Its action remains a real support contact until a secure payment backend exists.

### Public offer

The localized `/offer` document will replace all statements about a user-selected top-up, the 200 RUB minimum, and the 1:1 RUB balance rate. It will define the fixed package, acceptance, delivery moment, restrictions, and refund basis consistently with the pricing page.

### Refund rules

The localized `/refunds` document will state the qualifying condition, the 6 RUB-per-unused-credit calculation, the original-payment cap, and the existing support request channel. It will not promise refunds for credits already consumed.

### Consistency updates

The localized `/how-it-works` page and FAQ will remove the obsolete free-amount, 200 RUB minimum, and 1:1 language. They will describe choosing the fixed package and waiting for confirmed payment before crediting.

The landing page will not receive a new promotional pricing section. Existing generic links to balance top-up may remain if they do not state an obsolete price or rate.

## Source of truth

`lib/site/pricing.ts` will contain the fixed package data used by the pricing UI. Visible RU/EN strings will remain in `messages/ru.json` and `messages/en.json`. The legal documents remain in `lib/site/legal.ts` for this limited change; unrelated legal-content refactoring is out of scope.

Approved seller data remain unchanged:

- ИП Ревякина Кристина Степановна
- INN 230608772037
- OGRNIP 308236115500021
- `https://botguardthebest.ru`
- `kristinarwebdev@gmail.com`
- `+7 989 210-64-59`

## Payment boundary

This change does not implement payment creation, the YooKassa widget, webhooks, payment-status storage, or credit fulfillment. No client component may claim that payment succeeded or credit a balance.

Future payment work must create payments server-side from a server-controlled package ID, use a fresh confirmation token, and credit only after a verified terminal payment status. The return URL alone is not proof of payment. Relevant official guidance:

- <https://yookassa.ru/developers/payment-acceptance/integration-scenarios/widget/integration>
- <https://yookassa.ru/developers/using-api/webhooks>

Before activating checkout, the owner must separately approve the receipt item description, VAT code, payment mode, and payment subject with accounting/YooKassa guidance. This design deliberately does not invent those values.

## Error and support behavior

Because checkout is out of scope, the site has no new payment-state UI. The existing working email and phone channels remain the only action for top-up and refund questions. Public copy must not promise immediate payment availability.

## Verification

- RU and EN pricing, offer, refunds, how-it-works, and FAQ contain no obsolete 200 RUB minimum, arbitrary top-up, or 1:1 rate.
- Both locales show the same 100-credit/600-RUB package and refund calculation.
- No fake checkout, payment-success state, secret, or client-controlled price is introduced.
- Existing legal routes, header/footer links, theme behavior, and 320 px layouts continue to work.
- `npm run type-check`, relevant tests, and `npm run build` pass.
- An independent reviewer checks legal-data consistency, localization parity, and unsupported payment claims.

## Non-goals

- YooKassa API integration or credentials
- Checkout or payment-status pages
- Webhook processing and balance storage
- Homepage pricing promotion
- New packages, discounts, bonuses, subscriptions, or custom top-up amounts
- Deployment or publication
