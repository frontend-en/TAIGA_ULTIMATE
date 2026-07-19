import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { getMessages } from 'next-intl/server';
import '@/app/globals.css';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://taiga-ultimate.com'),
  title: 'TAIGA_ULTIMATE — Автоматизация бизнеса и AI-решения',
  description:
    'Автоматизирую рутину и собираю рабочие системы для бизнеса. AI-боты, интеграции, сайты, CRM — от заявки до готового решения.',
  keywords: ['AI', 'автоматизация', 'бизнес', 'боты', 'Telegram', 'CRM', 'интеграции'],
  authors: [{ name: 'TAIGA_ULTIMATE' }],
  creator: 'TAIGA_ULTIMATE',
  publisher: 'TAIGA_ULTIMATE',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'ru': '/ru',
      'en': '/en',
    },
  },
  openGraph: {
    title: 'TAIGA_ULTIMATE — Автоматизация бизнеса и AI-решения',
    description:
      'Автоматизирую рутину и собираю рабочие системы для бизнеса. AI-боты, интеграции, сайты, CRM.',
    type: 'website',
    locale: 'ru_RU',
    alternateLocale: 'en_US',
    siteName: 'TAIGA_ULTIMATE',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TAIGA_ULTIMATE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TAIGA_ULTIMATE — Автоматизация бизнеса и AI-решения',
    description:
      'Автоматизирую рутину и собираю рабочие системы для бизнеса. AI-боты, интеграции, сайты, CRM.',
    site: '@taiga_ultimate',
    creator: '@taiga_ultimate',
    images: ['/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TAIGA_ULTIMATE',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
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
              },
              {
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
              },
              {
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
              }
            ])
          }}
        />
      </head>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem locale={locale} messages={messages}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
