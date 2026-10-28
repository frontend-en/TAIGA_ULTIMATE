import { expect, test } from 'playwright/test';
import { trackLeadAssets, waitForLeadHydration } from './helpers/lead-form';

test.describe('personal bot landing', () => {
  test.beforeEach(({ page }) => {
    trackLeadAssets(page);
  });

  test('presents the personal bot as the primary Russian offer', async ({ page }) => {
    await page.goto('/ru', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: 'Ваш AI-друг. На одной волне.' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Хочу такого друга' }).first()).toHaveAttribute(
      'href',
      '/ru#lead-form'
    );
    await expect(page.getByRole('heading', { name: 'Хорошо, когда есть с кем подумать' })).toBeVisible();
    await expect(page.getByText('Другие AI-решения для бизнеса')).toBeVisible();
  });

  test('renders the complete English product journey', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);

    await expect(
      page.getByRole('heading', { level: 1, name: 'Your AI friend. On your wavelength.' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /From .* to .*hello/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What will your AI friend be like?' })).toBeVisible();
  });

  test('switches sample conversations without submitting a request', async ({ page }) => {
    test.setTimeout(60_000);
    let requests = 0;
    await page.route('**/api/leads', async (route) => {
      requests += 1;
      await route.abort();
    });
    await page.goto('/ru', { waitUntil: 'domcontentloaded' });

    const examples = page.getByRole('group', { name: 'О чём поговорим? Выберите пример:' });
    await waitForLeadHydration(page);
    await expect(examples.getByRole('button', { name: 'Нужна идея' })).toHaveAttribute('aria-pressed', 'true');
    await examples.getByRole('button', { name: 'Объясни проще' }).click();
    await expect(examples.getByRole('button', { name: 'Объясни проще' })).toHaveAttribute('aria-pressed', 'true');
    await expect(examples.getByRole('button', { name: 'Нужна идея' })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('Почему облака не падают? Только по-простому.')).toBeVisible();
    await expect(page.getByText('Что подарить другу, у которого всё есть?')).toHaveCount(0);
    await examples.getByRole('button', { name: 'Помоги с планом' }).click();
    await expect(page.getByText('Хочу читать больше, но всё откладываю.')).toBeVisible();
    expect(requests).toBe(0);
  });

  test('lets visitors name their messenger without a preset platform', async ({ page }) => {
    await page.goto('/ru#lead-form', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);

    const messenger = page.getByRole('textbox', { name: 'Где должен работать ваш бот?' });
    await expect(messenger).toBeEmpty();
    await expect(messenger).toHaveAttribute('placeholder', 'Название мессенджера');
    await expect(messenger).toHaveAttribute('required', '');
    await expect(page.locator('#lead-form select')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('lead.fields.');
  });

  test('explains invalid fields, focuses them, and preserves the draft', async ({ page }) => {
    let requests = 0;
    await page.route('**/api/leads', async (route) => {
      requests += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/ru#lead-form', { waitUntil: 'domcontentloaded' });

    const name = page.getByLabel('Ваше имя');
    await waitForLeadHydration(page);
    const messenger = page.getByRole('textbox', { name: 'Где должен работать ваш бот?' });
    await expect(name).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator('#lead-name-error')).toHaveCount(0);
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAttribute('aria-describedby', 'lead-name-error');
    await expect(page.locator('#lead-name-error')).toContainText('хотя бы 2 символа');

    await name.fill('Анна');
    await page.getByLabel('Как с вами связаться').fill('@anna');
    await messenger.fill('   ');
    await page.getByLabel('Каким должен быть ваш бот').fill('Хочу помощника для ежедневных рабочих задач.');
    await page.getByLabel(/Соглашаюсь/).check();
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(messenger).toBeFocused();
    await expect(messenger).toHaveAttribute('aria-invalid', 'true');
    await expect(messenger).toHaveAttribute('aria-describedby', 'lead-messenger-hint lead-messenger-error');
    await expect(page.locator('#lead-messenger-error')).toContainText('название нужного мессенджера');
    await expect(name).toHaveValue('Анна');
    expect(requests).toBe(0);

    await messenger.fill('Мой мессенджер');
    await expect(messenger).toBeFocused();
    await expect(messenger).toHaveAttribute('aria-invalid', 'false');
    await expect(messenger).toHaveAttribute('aria-describedby', 'lead-messenger-hint');
  });

  test('submits a qualified lead and announces success', async ({ page }) => {
    await page.route('**/api/leads', async (route) => {
      const request = route.request();
      const payload = request.postDataJSON();

      expect(payload).toMatchObject({
        name: 'Анна',
        contact: '@anna',
        messenger: 'Мой мессенджер, ещё одна площадка',
        consent: true,
      });
      expect(payload.botPurpose).toContain('помогал с текстами');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.goto('/ru#lead-form', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);
    await page.getByLabel('Ваше имя').fill('Анна');
    await page.getByLabel('Как с вами связаться').fill('@anna');
    await page.getByLabel('Где должен работать ваш бот?').fill('Мой мессенджер, ещё одна площадка');
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
        body: '{"ok":false,"code":"SERVICE_UNAVAILABLE"}',
      })
    );

    await page.goto('/ru#lead-form', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);
    await page.getByLabel('Ваше имя').fill('Анна');
    await page.getByLabel('Как с вами связаться').fill('@anna');
    await page.getByLabel('Где должен работать ваш бот?').fill('Мой мессенджер');
    await page.getByLabel('Каким должен быть ваш бот').fill('Хочу персонального помощника для ежедневных вопросов.');
    await page.getByLabel(/Соглашаюсь/).check();
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'Не удалось подтвердить отправку заявки' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Написать по email' })).toHaveAttribute(
      'href',
      'mailto:kristinarwebdev@gmail.com'
    );
    await expect(page.getByLabel('Ваше имя')).toHaveValue('Анна');
    await expect(page.getByLabel('Где должен работать ваш бот?')).toHaveValue('Мой мессенджер');
  });

  test('shows the floating CTA between the hero and lead form', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/ru', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);

    const floatingCta = page.locator('div.fixed').getByRole('link', { name: 'Хочу такого друга' });
    await expect(floatingCta).toBeHidden();
    await page.locator('#process').scrollIntoViewIfNeeded();
    await expect(floatingCta).toBeVisible();
    await expect(page.locator('div.fixed')).toHaveCSS('opacity', '1');
    await page.locator('#lead-form').scrollIntoViewIfNeeded();
    await expect(floatingCta).toBeHidden();
  });

  test('removes the floating CTA transition for people who prefer reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ru', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);

    await expect(page.locator('div.fixed')).toHaveCSS('transition-property', 'none');
  });

  test('keeps the closed mobile navigation out of the focus order', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ru', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);

    const toggle = page.getByRole('button', { name: 'Открыть меню' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-navigation')).toHaveCount(0);

    await toggle.click();
    await expect(page.getByRole('button', { name: 'Закрыть меню' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.locator('#mobile-navigation')).toBeVisible();
    await expect(page.locator('#mobile-navigation').getByRole('link', { name: 'Знакомство' })).toBeVisible();
  });

  test('exposes FAQ state and content with native button semantics', async ({ page }) => {
    await page.goto('/ru#faq', { waitUntil: 'domcontentloaded' });
    await waitForLeadHydration(page);

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
