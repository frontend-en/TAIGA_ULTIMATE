import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { TasksBlock } from '@/components/landing/TasksBlock';
import { ServicesBlock } from '@/components/landing/ServicesBlock';
import { AILLMBlock } from '@/components/landing/AILLMBlock';
import { BenefitsBlock } from '@/components/landing/BenefitsBlock';
import { WhyMeBlock } from '@/components/landing/WhyMeBlock';
import { ProcessBlock } from '@/components/landing/ProcessBlock';
import { FAQBlock } from '@/components/landing/FAQBlock';
import { CTASection } from '@/components/landing/CTASection';
import { StickyCTA } from '@/components/landing/StickyCTA';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen">
      <Header locale={locale} />
      <HeroSection locale={locale} />
      <TasksBlock locale={locale} />
      <ServicesBlock locale={locale} />
      <AILLMBlock locale={locale} />
      <BenefitsBlock locale={locale} />
      <WhyMeBlock locale={locale} />
      <ProcessBlock locale={locale} />
      <FAQBlock locale={locale} />
      <CTASection locale={locale} />
      <Footer locale={locale} />
      <StickyCTA locale={locale} />
    </main>
  );
}
