import type { Metadata } from 'next';
import { localUrl, type SiteLocale } from './business';

type PageMetadata = { title: string; description: string };

export function pageMetadata(locale: SiteLocale, path: string, copy: PageMetadata): Metadata {
  const canonical = localUrl(locale, path);
  const alternatePath = path || '';

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        ru: localUrl('ru', alternatePath),
        en: localUrl('en', alternatePath),
      },
    },
    openGraph: { title: copy.title, description: copy.description, url: canonical, locale: locale === 'ru' ? 'ru_RU' : 'en_US', type: 'website' },
  };
}
