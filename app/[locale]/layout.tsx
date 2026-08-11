import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { getMessages, getTranslations } from 'next-intl/server';
import '@/app/globals.css';
import { business, isSiteLocale, localUrl, siteOrigin } from '@/lib/site/business';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSiteLocale(rawLocale) ? rawLocale : 'ru';
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const canonical = localUrl(locale);

  return {
    metadataBase: new URL(siteOrigin),
    title: { default: t('title'), template: `%s | ${t('siteName')}` },
    description: t('description'),
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
      canonical,
      languages: { ru: localUrl('ru'), en: localUrl('en') },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: canonical,
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      siteName: t('siteName'),
    },
  };
}

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
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${siteOrigin}/#organization`,
              name: business.legalName,
              url: siteOrigin,
              email: business.email,
              telephone: business.phone,
              address: business.address,
            }).replace(/</g, '\\u003c'),
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
