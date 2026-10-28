import { expect, type Page } from 'playwright/test';

const failedAssets = new WeakMap<Page, string[]>();

export function trackLeadAssets(page: Page) {
  const failures: string[] = [];
  failedAssets.set(page, failures);
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/_next/static/')) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
}

export async function waitForLeadHydration(page: Page) {
  try {
    await expect(page.locator('#lead-form form')).toHaveAttribute('data-lead-ready', 'true', { timeout: 20_000 });
    await expect(page.locator('#lead-form button[type="submit"]')).toBeEnabled({ timeout: 20_000 });
  } catch (error) {
    const failures = failedAssets.get(page) ?? [];
    if (failures.length) {
      throw new Error(`Client hydration blocked by failed Next.js assets: ${failures.slice(0, 4).join('; ')}`, { cause: error });
    }
    throw error;
  }
}

export async function fillLead(page: Page, locale: 'ru' | 'en' = 'ru') {
  await page.getByLabel(locale === 'ru' ? 'Ваше имя' : 'Your name').fill('Anna');
  await page.getByLabel(locale === 'ru' ? 'Как с вами связаться' : 'How can we reach you?').fill('@anna');
  await page.getByLabel(locale === 'ru' ? 'Где должен работать ваш бот?' : 'Where should your bot work?').fill('My messenger');
  await page.getByLabel(locale === 'ru' ? 'Каким должен быть ваш бот' : 'What should your bot be like?').fill('I want a personal assistant for daily questions and ideas.');
  await page.getByLabel(locale === 'ru' ? /Соглашаюсь/ : /I agree/).check();
}
