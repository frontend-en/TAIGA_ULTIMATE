import type { Metadata } from 'next';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { LegalDocument } from '@/components/site/LegalDocument';
import { PublicPageLayout } from '@/components/site/PublicPageLayout';
import { isSiteLocale } from '@/lib/site/business';
import { legalContent } from '@/lib/site/legal';
import { pageMetadata } from '@/lib/site/seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSiteLocale(rawLocale) ? rawLocale : 'ru';
  const document = legalContent[locale].requisites;
  return pageMetadata(locale, '/requisites', { title: document.title, description: document.title });
}

export default async function RequisitesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isSiteLocale(rawLocale) ? rawLocale : 'ru';
  const document = legalContent[locale].requisites;
  return <><Header locale={locale} /><PublicPageLayout title={document.title}><LegalDocument document={document} /></PublicPageLayout><Footer locale={locale} /></>;
}
