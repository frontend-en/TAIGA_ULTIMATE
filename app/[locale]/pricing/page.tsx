import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { PublicPageLayout } from '@/components/site/PublicPageLayout';
import { business, isSiteLocale } from '@/lib/site/business';
import { pageMetadata } from '@/lib/site/seo';
import { pricing } from '@/lib/site/pricing';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSiteLocale(rawLocale) ? rawLocale : 'ru';
  const t = await getTranslations({ locale, namespace: 'pages.pricing' });
  return pageMetadata(locale, '/pricing', { title: t('metaTitle'), description: t('metaDescription') });
}

export default async function PricingPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isSiteLocale(rawLocale) ? rawLocale : 'ru';
  const t = await getTranslations({ locale, namespace: 'pages.pricing' });
  const facts = [t('facts.minimum', { amount: pricing.minimumTopUpRub }), t('facts.rate'), t('facts.confirmation')];

  return (
    <>
      <Header locale={locale} />
      <PublicPageLayout title={t('title')} description={t('description')}>
        <section className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <div className="rounded-2xl border border-primary-border bg-card p-6 shadow-card sm:p-8">
            <div className="flex items-start gap-4">
              <CircleDollarSign className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">{t('balanceTitle')}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{t('balanceDescription')}</p>
              </div>
            </div>
            <ul className="mt-7 space-y-4">
              {facts.map((fact) => (
                <li key={fact} className="flex gap-3 leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-2xl border bg-card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">{t('paymentTitle')}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{t('paymentDescription')}</p>
              </div>
            </div>
            <a className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`mailto:${business.email}`}>
              {t('contactCta')}
            </a>
          </div>
        </section>
      </PublicPageLayout>
      <Footer locale={locale} />
    </>
  );
}
