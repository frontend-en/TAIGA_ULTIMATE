'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Globe2, PlugZap, Workflow, Wrench } from 'lucide-react';

const icons = [Workflow, PlugZap, Globe2, Wrench];

export function ServicesBlock() {
  const t = useTranslations('services');
  const prefersReducedMotion = useReducedMotion();
  const items = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section id="services" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-24">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-10 rounded-[2.5rem] border border-border/70 bg-card/50 p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          >
            <p className="mb-4 text-sm font-bold tracking-wide text-primary">{t('eyebrow')}</p>
            <h2 className="text-balance font-display text-3xl font-bold leading-[1.15] tracking-[-0.03em] sm:text-4xl">{t('title')}</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{t('subtitle')}</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            {items.map((item, index) => {
              const Icon = icons[index] ?? Wrench;
              return (
                <motion.article
                  key={item.title}
                  className="relative border-t border-border/80 pt-5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
