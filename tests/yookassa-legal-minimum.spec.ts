import { expect, test } from 'playwright/test';

test.describe('YooKassa legal minimum', () => {
  test('publishes one fixed Russian package without obsolete top-up terms', async ({ page }) => {
    await page.goto('/ru/pricing');

    const russianPackages = page.getByRole('list', { name: 'Доступные пакеты' });
    await expect(russianPackages).toBeVisible();
    await expect(russianPackages.locator(':scope > li')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Пакет внутренних кредитов' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '100 внутренних кредитов' })).toHaveCount(1);
    await expect(page.getByText('600 ₽', { exact: true })).toHaveCount(1);
    await expect(page.getByText('6 ₽ за 1 внутренний кредит')).toBeVisible();
    await expect(page.getByText(/только для AI-функций.*подключ[её]нного бота/i)).toBeVisible();
    await expect(page.getByText(/только после.*серверного подтверждения.*успешного платежа.*YooKassa/i)).toBeVisible();
    await expect(page.getByText(/возврат на страницу после оплаты.*не.*подтвержд.*плат[её]ж/i)).toBeVisible();
    await expect(page.getByText(/Внутренние кредиты не являются деньгами/i)).toBeVisible();
    await expect(page.getByText(/не являются инвестицией/i)).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Минимальная сумма пополнения');
    await expect(page.locator('body')).not.toContainText('1 ₽ оплаты = 1 ₽ внутреннего баланса');
  });

  test('keeps the English legal package equivalent to the Russian package', async ({ page }) => {
    await page.goto('/en/pricing');

    const englishPackages = page.getByRole('list', { name: 'Available packages' });
    await expect(englishPackages).toBeVisible();
    await expect(englishPackages.locator(':scope > li')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Internal credit package' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '100 internal credits' })).toHaveCount(1);
    await expect(page.getByText('RUB 600', { exact: true })).toHaveCount(1);
    await expect(page.getByText('RUB 6 per internal credit')).toBeVisible();
    await expect(page.getByText(/only for AI features of an already connected bot/i)).toBeVisible();
    await expect(page.getByText(/only after.*server-side confirmation.*successful YooKassa payment/i)).toBeVisible();
    await expect(page.getByText(/return.*page.*alone.*not.*proof of payment/i)).toBeVisible();
    await expect(page.getByText(/Internal credits are not money/i)).toBeVisible();
    await expect(page.getByText(/are not an investment/i)).toBeVisible();
    await expect(page.locator('body')).not.toContainText('RUB 1 paid = RUB 1');
  });

  test('publishes the approved offer in both locales', async ({ page }) => {
    await page.goto('/ru/offer');
    await expect(page.getByText('100 внутренних кредитов за 600 ₽')).toBeVisible();
    await expect(page.getByText(/11 августа 2026/)).toBeVisible();
    await expect(page.getByText(/не передаются.*не выводятся.*не обмениваются.*не используются вне Сервиса/i)).toBeVisible();
    await expect(page.getByText(/Внутренние кредиты не являются деньгами/i)).toBeVisible();
    await expect(page.getByText(/не являются инвестицией/i)).toBeVisible();
    await expect(page.getByText(/только после.*подтверждения успешного платежа/i)).toBeVisible();
    await expect(page.getByText(/переход.*страницу после оплаты.*не.*подтвержда/i)).toBeVisible();
    await expect(page.locator('body')).not.toContainText('не менее 200 ₽');

    await page.goto('/en/offer');
    await expect(page.getByText('100 internal credits for RUB 600')).toBeVisible();
    await expect(page.getByText(/11 August 2026/)).toBeVisible();
    await expect(page.getByText(/cannot be transferred, withdrawn, exchanged, or used outside the Service/i)).toBeVisible();
    await expect(page.getByText(/Internal credits are not money/i)).toBeVisible();
    await expect(page.getByText(/are not an investment/i)).toBeVisible();
    await expect(page.getByText(/only after.*successful payment/i)).toBeVisible();
    await expect(page.getByText(/return.*page.*alone.*not.*proof of payment/i)).toBeVisible();
  });

  test('publishes the approved refund grounds and calculation in both locales', async ({ page }) => {
    await page.goto('/ru/refunds');
    await expect(page.getByText(/сервис.*не работает.*по причинам.*зависящим от Исполнителя/i)).toBeVisible();
    await expect(page.getByText(/только неиспользованн.*внутренн.*кредит/i)).toBeVisible();
    await expect(page.getByText(/6 ₽.*за кажд[ыи]й неиспользованн.*внутренн.*кредит/i)).toBeVisible();
    await expect(page.getByText(/не превыша[её]т.*600 ₽/i)).toBeVisible();

    await page.goto('/en/refunds');
    await expect(page.getByText(/service.*unavailable.*reasons attributable to the Provider/i)).toBeVisible();
    await expect(page.getByText(/only unused internal credits/i)).toBeVisible();
    await expect(page.getByText(/RUB 6 for each unused internal credit/i)).toBeVisible();
    await expect(page.getByText(/cannot exceed.*original RUB 600 payment/i)).toBeVisible();
  });

  test('keeps explanatory pages consistent with the fixed package', async ({ page }) => {
    await page.goto('/ru/how-it-works');
    await expect(page.getByText('Выберите пакет из 100 внутренних кредитов за 600 ₽.')).toBeVisible();

    await page.goto('/ru#faq');
    const paymentFaq = page.getByRole('button', { name: 'Как оплачиваются AI-запросы после запуска?' });
    await paymentFaq.click();
    await expect(paymentFaq).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/Пакет из 100 внутренних кредитов стоит 600 ₽/)).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Минимальное пополнение — 200 ₽');

    await page.goto('/en/how-it-works');
    await expect(page.getByText('Choose a package of 100 internal credits for RUB 600.')).toBeVisible();

    await page.goto('/en#faq');
    const englishPaymentFaq = page.getByRole('button', { name: 'How are AI requests paid for after launch?' });
    await englishPaymentFaq.click();
    await expect(englishPaymentFaq).toHaveAttribute('aria-expanded', 'true');
    const englishPaymentAnswer = page.getByText(/A package of 100 internal credits costs RUB 600/);
    await expect(englishPaymentAnswer).toBeVisible();
    await expect(englishPaymentAnswer).toContainText('does not pay for bot development or its initial connection');
    await expect(page.locator('body')).not.toContainText('Minimum top-up — RUB 200');
    await expect(page.locator('body')).not.toContainText('RUB 1 paid = RUB 1');
  });
});
