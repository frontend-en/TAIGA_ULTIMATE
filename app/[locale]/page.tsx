import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { PersonalBotSection } from '@/components/landing/PersonalBotSection';
import { BotProcessSection } from '@/components/landing/BotProcessSection';
import { ServicesBlock } from '@/components/landing/ServicesBlock';
import { WhyMeBlock } from '@/components/landing/WhyMeBlock';
import { FAQBlock } from '@/components/landing/FAQBlock';
import { LeadFormSection } from '@/components/landing/LeadFormSection';
import { StickyCTA } from '@/components/landing/StickyCTA';
import { siteOrigin } from '@/lib/site/business';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name:
      locale === 'ru'
        ? 'Персональный AI-бот в вашем мессенджере'
        : 'Your personal AI bot in your messenger',
    description:
      locale === 'ru'
        ? 'Настройка и подключение персонального AI-помощника к выбранному мессенджеру после проверки совместимости.'
        : 'Configuration and connection of a personal AI assistant to the selected messenger after a compatibility check.',
    serviceType: 'Personal AI bot development',
    provider: { '@id': `${siteOrigin}/#organization` },
    areaServed: 'Worldwide',
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(service).replace(/</g, '\\u003c'),
        }}
      />
      <Header locale={locale} />
      <HeroSection locale={locale} />
      <PersonalBotSection />
      <BotProcessSection />
      <ServicesBlock />
      <WhyMeBlock />
      <FAQBlock />
      <LeadFormSection locale={locale} />
      <Footer locale={locale} />
      <StickyCTA locale={locale} />
    </main>
  );
}
