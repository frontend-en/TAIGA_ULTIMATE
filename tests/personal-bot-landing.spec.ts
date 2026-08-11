import { expect, test } from 'playwright/test';

test.describe('personal bot landing', () => {
  test('presents the personal bot as the primary Russian offer', async ({ page }) => {
    await page.goto('/ru');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Персональный AI-бот в вашем мессенджере' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Заказать бота' }).first()).toHaveAttribute(
      'href',
      '/ru#lead-form'
    );
    await expect(page.getByRole('heading', { name: 'Ваш помощник уже в привычном чате' })).toBeVisible();
    await expect(page.getByText('Другие AI-решения для бизнеса')).toBeVisible();
  });

  test('renders the complete English product journey', async ({ page }) => {
    await page.goto('/en');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Your personal AI bot in your messenger' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'How your bot goes live' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tell us what your bot should be like' })).toBeVisible();
  });

  test('only names MAX and VK as selectable platforms', async ({ page }) => {
    await page.goto('/ru#lead-form');

    const options = page.getByLabel('Мессенджер').locator('option');
    await expect(options).toHaveText(['MAX', 'VK', 'Другой мессенджер']);
    await expect(options).toHaveCount(3);
    await expect(page.locator('body')).not.toContainText('lead.fields.');
  });

  test('submits a qualified lead and announces success', async ({ page }) => {
    await page.route('**/api/leads', async (route) => {
      const request = route.request();
      const payload = request.postDataJSON();

      expect(payload).toMatchObject({
        name: 'Анна',
        contact: '@anna',
        messenger: 'max',
        consent: true,
      });
      expect(payload.botPurpose).toContain('помогал с текстами');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.goto('/ru#lead-form');
    await page.getByLabel('Ваше имя').fill('Анна');
    await page.getByLabel('Как с вами связаться').fill('@anna');
    await page.getByLabel('Мессенджер').selectOption('max');
    await page.getByLabel('Каким должен быть ваш бот').fill('Хочу, чтобы бот помогал с текстами и идеями каждый день.');
    await page.getByLabel(/Соглашаюсь/).check();
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('status')).toContainText('Заявка отправлена');
  });

  test('offers a direct email fallback when delivery fails', async ({ page }) => {
    await page.route('**/api/leads', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"ok":false,"code":"DELIVERY_ERROR"}',
      })
    );

    await page.goto('/ru#lead-form');
    await page.getByLabel('Ваше имя').fill('Анна');
    await page.getByLabel('Как с вами связаться').fill('@anna');
    await page.getByLabel('Мессенджер').selectOption('max');
    await page.getByLabel('Каким должен быть ваш бот').fill('Хочу персонального помощника для ежедневных вопросов.');
    await page.getByLabel(/Соглашаюсь/).check();
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'Не удалось отправить заявку' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Написать по email' })).toHaveAttribute(
      'href',
      'mailto:kristinarwebdev@gmail.com'
    );
  });

  test('does not cover the lead form with the floating CTA', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/ru#lead-form');

    const floatingCta = page.locator('div.fixed').getByRole('link', { name: 'Заказать бота' });
    await expect(floatingCta).toBeHidden();
  });

  test('removes the floating CTA transition for people who prefer reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ru');

    await expect(page.locator('div.fixed')).toHaveCSS('transition-property', 'none');
  });

  test('keeps the closed mobile navigation out of the focus order', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ru');

    const toggle = page.getByRole('button', { name: 'Открыть меню' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-navigation')).toHaveCount(0);

    await toggle.click();
    await expect(page.getByRole('button', { name: 'Закрыть меню' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.locator('#mobile-navigation')).toBeVisible();
    await expect(page.locator('#mobile-navigation').getByRole('link', { name: 'Возможности' })).toBeVisible();
  });

  test('exposes FAQ state and content with native button semantics', async ({ page }) => {
    await page.goto('/ru#faq');

    const trigger = page.getByRole('button', {
      name: 'В каком мессенджере может работать бот?',
    });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByRole('region', {
        name: 'В каком мессенджере может работать бот?',
      }),
    ).toBeVisible();
  });
});
