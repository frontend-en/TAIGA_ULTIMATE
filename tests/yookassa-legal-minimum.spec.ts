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
