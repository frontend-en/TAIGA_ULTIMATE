'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Globe2, PlugZap, Workflow, Wrench } from 'lucide-react';

const icons = [Workflow, PlugZap, Globe2, Wrench];

export function ServicesBlock() {
  const t = useTranslations('services');
  const prefersReducedMotion = useReducedMotion();
  const items = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section id="services" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
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

          <div className="grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2">
            {items.map((item, index) => {
              const Icon = icons[index] ?? Wrench;
              return (
                <motion.article
                  key={item.title}
                  className="group relative min-h-64 bg-card p-6 transition-colors hover:bg-primary-subtle/40 sm:p-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-10 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
