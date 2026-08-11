import type { MetadataRoute } from 'next';
import { localUrl, supportedLocales } from '@/lib/site/business';

const paths = ['', '/pricing', '/how-it-works', '/offer', '/refunds', '/privacy', '/requisites'];

export default function sitemap(): MetadataRoute.Sitemap {
  return supportedLocales.flatMap((locale) => paths.map((path) => ({
    url: localUrl(locale, path),
    lastModified: new Date('2026-07-21T00:00:00.000Z'),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  })));
}
