import { expect, test } from 'playwright/test';
import { fillLead, trackLeadAssets, waitForLeadHydration } from './helpers/lead-form';

test.beforeEach(({ page }) => {
  trackLeadAssets(page);
});

test('submits business fields without a provider token or CAPTCHA', async ({ page }) => {
  const captchaRequests: string[] = [];
  page.on('request', (request) => {
    if (/challenges\.cloudflare\.com|recaptcha|hcaptcha/i.test(request.url())) captchaRequests.push(request.url());
  });
  await page.route('**/api/leads', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      name: 'Anna',
      contact: '@anna',
      messenger: 'My messenger',
      botPurpose: 'I want a personal assistant for daily questions and ideas.',
      consent: true,
      website: '',
    });
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/ru#lead-form', { waitUntil: 'domcontentloaded' });
  await waitForLeadHydration(page);
  await fillLead(page);
  await expect(page.locator('script[src*="challenges.cloudflare.com"], iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  await expect(page.getByRole('status')).toContainText('Заявка отправлена');
  expect(captchaRequests).toEqual([]);
});

test('preserves the draft across failed attempts and respects retry cooldowns', async ({ page }) => {
  test.setTimeout(60_000);
  let requests = 0;
  const statuses = [409, 422, 429, 503];
  const notices = [
    'Такая заявка уже обрабатывается.',
    'Заявка не прошла автоматическую проверку.',
    'Слишком много попыток.',
    'Не удалось подтвердить отправку заявки',
  ];
  await page.route('**/api/leads', async (route) => {
    const status = statuses[requests++];
    await route.fulfill({ status, headers: { 'Retry-After': '1' }, contentType: 'application/json', body: '{"ok":false}' });
  });
  await page.goto('/ru#lead-form', { waitUntil: 'domcontentloaded' });
  await waitForLeadHydration(page);
  await fillLead(page);
  const submit = page.getByRole('button', { name: 'Отправить заявку' });
  for (let index = 0; index < statuses.length; index++) {
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect.poll(() => requests).toBe(index + 1);
    await expect(page.locator('#lead-form').getByRole('alert')).toContainText(notices[index]);
    await expect(page.getByLabel('Ваше имя')).toHaveValue('Anna');
    if (statuses[index] === 409 || statuses[index] === 429) {
      await expect(page.getByText(/Повторная отправка будет доступна через/)).toBeVisible();
      await expect(submit).toBeDisabled();
    }
  }
  await expect(page.getByLabel('Каким должен быть ваш бот')).toHaveValue('I want a personal assistant for daily questions and ideas.');
});

test('can retry after a network failure and submit again after success', async ({ page }) => {
  test.setTimeout(60_000);
  let requests = 0;
  await page.route('**/api/leads', async (route) => {
    requests++;
    if (requests === 1) await route.abort('failed');
    else await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/en#lead-form', { waitUntil: 'domcontentloaded' });
  await waitForLeadHydration(page);
  await fillLead(page, 'en');
  const submit = page.getByRole('button', { name: 'Send request', exact: true });
  await submit.click();
  await expect(page.locator('#lead-form').getByRole('alert')).toContainText("We couldn't confirm your request was sent");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole('status')).toContainText('Request sent');
  await page.getByRole('button', { name: 'Send another request' }).click();
  await fillLead(page, 'en');
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole('status')).toContainText('Request sent');
  expect(requests).toBe(3);
});

test('blocks concurrent submissions while the request is pending', async ({ page }) => {
  let requests = 0;
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => { finish = resolve; });
  await page.route('**/api/leads', async (route) => {
    requests++;
    await pending;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/ru#lead-form', { waitUntil: 'domcontentloaded' });
  await waitForLeadHydration(page);
  await fillLead(page);
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  await expect.poll(() => requests).toBe(1);
  await expect(page.getByRole('button', { name: 'Отправляем…' })).toBeDisabled();
  await page.locator('#lead-form form').evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
    (form as HTMLFormElement).requestSubmit();
  });
  expect(requests).toBe(1);
  finish?.();
  await expect(page.getByRole('status')).toContainText('Заявка отправлена');
  expect(requests).toBe(1);
});

test('maps only known server field errors to local messages and focus', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({ ok: false, fieldErrors: { contact: 'invalid', secret: 'do-not-display', name: 123 } }),
  }));
  await page.goto('/en#lead-form', { waitUntil: 'domcontentloaded' });
  await waitForLeadHydration(page);
  await fillLead(page, 'en');
  await page.getByRole('button', { name: 'Send request', exact: true }).click();
  await expect(page.getByLabel('How can we reach you?')).toBeFocused();
  await expect(page.locator('#lead-contact-error')).toHaveText('Leave contact details with at least 3 characters.');
  await expect(page.locator('body')).not.toContainText('do-not-display');
  await expect(page.getByLabel('How can we reach you?')).toHaveValue('@anna');
});

test('shows the English rejection without exposing provider results', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: '{"ok":false,"code":"SUBMISSION_REJECTED"}' }));
  await page.goto('/en#lead-form', { waitUntil: 'domcontentloaded' });
  await waitForLeadHydration(page);
  await fillLead(page, 'en');
  await page.getByRole('button', { name: 'Send request', exact: true }).click();
  await expect(page.locator('#lead-form').getByRole('alert')).toContainText('Your request did not pass the automatic check.');
  await expect(page.getByLabel('Your name')).toHaveValue('Anna');
});
