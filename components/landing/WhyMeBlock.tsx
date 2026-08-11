'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Blocks, LifeBuoy, ScanSearch } from 'lucide-react';

const icons = [ScanSearch, Blocks, LifeBuoy];

export function WhyMeBlock() {
  const t = useTranslations('whyMe');
  const prefersReducedMotion = useReducedMotion();
  const items = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section className="border-y bg-card px-4 py-20 sm:px-6 md:py-24">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl md:text-5xl">{t('title')}</h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = icons[index] ?? Blocks;
            return (
              <motion.article
                key={item.title}
                className="rounded-3xl border bg-background p-6 sm:p-8"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : index * 0.08 }}
              >
                <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
