'use client';

import { useLocale } from 'next-intl';

interface UseSEOReturn {
  locale: string;
  isRussian: boolean;
  organizationSchema: Record<string, unknown>;
  websiteSchema: Record<string, unknown>;
  serviceSchema: Record<string, unknown>;
  openGraph: {
    title: string;
    description: string;
    locale: string;
    alternateLocale: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
  };
}

export function useSEO(): UseSEOReturn {
  const locale = useLocale();
  const isRussian = locale === 'ru';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TAIGA ULTIMATE',
    url: 'https://taiga-ultimate.com',
    logo: 'https://taiga-ultimate.com/logo.png',
    description: isRussian
      ? 'Автоматизация бизнеса и AI-решения под ключ. AI-боты, интеграции, сайты, CRM.'
      : 'Business Automation & AI Solutions. AI bots, integrations, websites, CRM.',
    sameAs: [
      'https://t.me/taiga_ultimate',
      'https://wa.me/taiga_ultimate'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      availableLanguage: ['Russian', 'English'],
      contactType: 'customer service'
    }
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TAIGA ULTIMATE',
    url: 'https://taiga-ultimate.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://taiga-ultimate.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Business Automation & AI Solutions',
    description: isRussian
      ? 'Автоматизация бизнеса: AI-боты, CRM-интеграции, веб-разработка, обработка заявок'
      : 'Business automation: AI bots, CRM integrations, web development, request processing',
    provider: {
      '@type': 'Organization',
      name: 'TAIGA ULTIMATE'
    },
    areaServed: 'Worldwide',
    serviceType: 'Business Automation'
  };

  return {
    locale,
    isRussian,
    organizationSchema,
    websiteSchema,
    serviceSchema,
    openGraph: {
      title: 'TAIGA ULTIMATE — Автоматизация бизнеса и AI-решения',
      description: isRussian
        ? 'Автоматизирую рутину и собираю рабочие системы для бизнеса. AI-боты, интеграции, сайты, CRM.'
        : 'Business Automation & AI Solutions. AI bots, integrations, websites, CRM.',
      locale: isRussian ? 'ru_RU' : 'en_US',
      alternateLocale: isRussian ? 'en_US' : 'ru_RU'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'TAIGA ULTIMATE — Автоматизация бизнеса и AI-решения',
      description: isRussian
        ? 'Автоматизирую рутину и собираю рабочие системы для бизнеса. AI-боты, интеграции, сайты, CRM.'
        : 'Business Automation & AI Solutions. AI bots, integrations, websites, CRM.'
    }
  };
}
