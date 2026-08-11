'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BrainCircuit, Fingerprint, Gauge, MessagesSquare, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const featureIcons = [MessagesSquare, SlidersHorizontal, BrainCircuit, Fingerprint, Gauge];

export function PersonalBotSection() {
  const t = useTranslations('botFeatures');
  const prefersReducedMotion = useReducedMotion();
  const features = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border border-primary-border bg-card shadow-xl shadow-primary/10">
              <div className="flex items-center justify-between border-b bg-muted/50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">AI</div>
                  <div>
                    <p className="text-sm font-semibold">{t('demo.name')}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {t('demo.status')}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('demo.badge')}
                </span>
              </div>

              <div className="space-y-5 bg-[linear-gradient(145deg,hsl(var(--muted)/0.55),transparent)] p-5 sm:p-7">
                <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm">
                  {t('demo.user')}
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border bg-background px-4 py-3 text-sm leading-6 shadow-sm">
                  {t('demo.bot')}
                </div>
                <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm">
                  {t('demo.userFollowup')}
                </div>
                <div className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
                  <span>{t('demo.typing')}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">{t('demo.caption')}</p>
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl md:text-5xl">
                {t('title')}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{t('subtitle')}</p>
            </motion.div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = featureIcons[index] ?? MessagesSquare;
                return (
                  <motion.article
                    key={feature.title}
                    className={cn(
                      'rounded-2xl border bg-card p-5',
                      index === features.length - 1 && 'sm:col-span-2',
                    )}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                  >
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
