'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Accordion } from '@/components/ui/Accordion';

export function FAQBlock() {
  const t = useTranslations('faq');
  const prefersReducedMotion = useReducedMotion();
  const items = t.raw('items') as Array<{ question: string; answer: string }>;

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
      <div className="container mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl md:text-5xl">{t('title')}</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          className="rounded-3xl border bg-card px-5 sm:px-7"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
        >
          <Accordion items={items} />
        </motion.div>
      </div>
    </section>
  );
}
