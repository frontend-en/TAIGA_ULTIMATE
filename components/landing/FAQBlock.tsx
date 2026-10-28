'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Accordion } from '@/components/ui/Accordion';
import { MessageCircleQuestion } from 'lucide-react';

export function FAQBlock() {
  const t = useTranslations('faq');
  const prefersReducedMotion = useReducedMotion();
  const items = t.raw('items') as Array<{ question: string; answer: string }>;

  return (
    <section id="faq" className="scroll-mt-24 border-t border-border/60 px-4 py-20 sm:px-6 md:py-24">
      <div className="container mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <div className="mb-6 grid h-16 w-16 rotate-[-8deg] place-items-center rounded-[1.4rem] bg-[hsl(var(--friend-lilac))]" aria-hidden="true"><MessageCircleQuestion className="h-8 w-8 rotate-[8deg] text-foreground" /></div>
          <p className="mb-4 text-sm font-bold tracking-wide text-primary">{t('eyebrow')}</p>
          <h2 className="text-balance font-display text-3xl font-bold leading-[1.12] tracking-[-0.03em] sm:text-4xl md:text-5xl">{t('title')}</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          className="rounded-[2rem] bg-muted/50 p-3 sm:p-4 [&_button]:text-base [&_button]:font-bold [&_button]:sm:p-5 [&_button]:sm:text-lg"
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
