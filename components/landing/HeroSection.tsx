'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowDown } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('hero');
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-16 sm:py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/5 via-transparent to-primary/10" />
        <div className="absolute top-20 right-4 sm:right-10 md:right-20 w-72 sm:w-96 h-72 sm:h-96 bg-mint/20 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="absolute bottom-20 left-4 sm:left-10 md:left-20 w-56 sm:w-72 h-56 sm:h-72 bg-primary/10 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      <div className="container mx-auto text-center max-w-4xl">
        <motion.div {...fadeUp}>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-normal mb-6">
            {t('headline')}
          </h1>
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {t('subheadline')}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a href={`/${locale}#contact`} className={buttonVariants({ size: 'lg', variant: 'cta' })}>
            {t('cta')}
          </a>
          <a href={`/${locale}#services`} className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            {t('ctaSecondary')}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <a
          href={`/${locale}#tasks`}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
