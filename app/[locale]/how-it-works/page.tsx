import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { PublicPageLayout } from '@/components/site/PublicPageLayout';
import { isSiteLocale } from '@/lib/site/business';
import { pageMetadata } from '@/lib/site/seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSiteLocale(rawLocale) ? rawLocale : 'ru';
  const t = await getTranslations({ locale, namespace: 'pages.howItWorks' });
  return pageMetadata(locale, '/how-it-works', { title: t('metaTitle'), description: t('metaDescription') });
}

export default async function HowItWorksPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isSiteLocale(rawLocale) ? rawLocale : 'ru';
  const t = await getTranslations({ locale, namespace: 'pages.howItWorks' });
  const steps = ['choose', 'payment', 'confirmation', 'credit', 'access'] as const;

  return (
    <>
      <Header locale={locale} />
      <PublicPageLayout title={t('title')} description={t('description')}>
        <ol className="container mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step} className="relative rounded-2xl border bg-card p-5 shadow-card">
              <span className="text-sm font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{t(`steps.${step}.title`)}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(`steps.${step}.description`)}</p>
              {index < steps.length - 1 ? <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 text-primary lg:block" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
        <section className="container mx-auto max-w-4xl px-4 pb-12 sm:pb-16">
          <div className="rounded-2xl border border-primary-border bg-primary-subtle/40 p-6 sm:p-8">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="leading-7 text-muted-foreground">{t('notice')}</p>
            </div>
          </div>
        </section>
      </PublicPageLayout>
      <Footer locale={locale} />
    </>
  );
}
