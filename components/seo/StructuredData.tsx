'use client';

import { useLocale } from 'next-intl';

interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export function useStructuredData() {
  const locale = useLocale();

  const organizationSchema: SchemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TAIGA ULTIMATE',
    url: 'https://taiga-ultimate.com',
    logo: 'https://taiga-ultimate.com/logo.png',
    description: locale === 'ru'
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

  const websiteSchema: SchemaData = {
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

  const serviceSchema: SchemaData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Business Automation & AI Solutions',
    description: locale === 'ru'
      ? 'Автоматизация бизнеса: AI-боты, CRM-интеграции, веб-разработка, обработка заявок'
      : 'Business automation: AI bots, CRM integrations, web development, request processing',
    provider: {
      '@type': 'Organization',
      name: 'TAIGA ULTIMATE'
    },
    areaServed: 'Worldwide',
    serviceType: 'Business Automation'
  };

  return { organizationSchema, websiteSchema, serviceSchema };
}

export function generateSchemaScript(schemas: ReturnType<typeof useStructuredData>): string {
  return JSON.stringify([schemas.organizationSchema, schemas.websiteSchema, schemas.serviceSchema]);
}
