'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowDown, MessageSquareText, Rocket, Settings2 } from 'lucide-react';

const icons = [MessageSquareText, Settings2, Rocket];

export function BotProcessSection() {
  const t = useTranslations('botProcess');
  const prefersReducedMotion = useReducedMotion();
  const steps = t.raw('steps') as Array<{ title: string; description: string }>;

  return (
    <section id="process" className="scroll-mt-24 border-y bg-muted/35 px-4 py-20 sm:px-6 md:py-28">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl md:text-5xl">{t('title')}</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = icons[index] ?? Rocket;
            return (
              <motion.article
                key={step.title}
                className="relative overflow-hidden rounded-3xl border bg-background p-6 sm:p-8"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.08 }}
              >
                <span className="absolute right-5 top-3 font-display text-6xl font-bold text-primary/5">0{index + 1}</span>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowDown className="absolute bottom-5 right-5 h-5 w-5 text-primary/30 lg:hidden" aria-hidden="true" />
                )}
              </motion.article>
            );
          })}
        </div>

        <p className="mt-7 max-w-3xl text-sm leading-6 text-muted-foreground">{t('note')}</p>
      </div>
    </section>
  );
}
