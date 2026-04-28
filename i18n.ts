import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  if (!locale || !['ru', 'en'].includes(locale)) {
    notFound();
  }

  return {
    locale,
    timeZone: 'Europe/Moscow',
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
