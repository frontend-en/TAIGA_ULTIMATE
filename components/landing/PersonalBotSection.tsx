'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Fingerprint, Gauge, Lightbulb, MessagesSquare, SlidersHorizontal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FriendMascot } from '@/components/landing/FriendMascot';

const featureIcons = [MessagesSquare, SlidersHorizontal, Lightbulb, Fingerprint, Gauge];

export function PersonalBotSection() {
  const t = useTranslations('botFeatures');
  const prefersReducedMotion = useReducedMotion();
  const features = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <motion.div
            className="relative mx-auto w-full max-w-lg lg:pr-4"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            <div className="absolute -inset-x-3 inset-y-6 -z-10 rotate-[-4deg] rounded-[3rem] bg-[hsl(var(--friend-sage))] sm:-inset-x-5" aria-hidden="true" />
            <Sparkles className="absolute -right-2 -top-7 h-9 w-9 rotate-12 text-primary sm:-right-5" aria-hidden="true" />
            <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[0_18px_45px_-24px_hsl(var(--foreground)/0.22)]">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/10"><FriendMascot compact className="h-10 w-10" /></div>
                  <div>
                    <p className="text-sm font-semibold">{t('demo.name')}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#567449] dark:bg-[#a2bd89]" />
                      {t('demo.status')}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
                  {t('demo.badge')}
                </span>
              </div>

              <div className="space-y-5 bg-[hsl(var(--friend-sage)/0.4)] p-5 sm:p-7">
                <div className="ml-auto max-w-[86%] rounded-[1.35rem] rounded-br-sm bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                  {t('demo.user')}
                </div>
                <div className="max-w-[92%] rounded-[1.35rem] rounded-bl-sm bg-card px-4 py-4 text-sm leading-7 shadow-sm">
                  {t('demo.bot')}
                </div>
                <div className="ml-auto max-w-[86%] rounded-[1.35rem] rounded-br-sm bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                  {t('demo.userFollowup')}
                </div>
                <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
                  <span className="flex gap-1" aria-hidden="true"><span className="h-1 w-1 animate-pulse rounded-full bg-current motion-reduce:animate-none" /><span className="h-1 w-1 animate-pulse rounded-full bg-current motion-reduce:animate-none" /><span className="h-1 w-1 animate-pulse rounded-full bg-current motion-reduce:animate-none" /></span>
                  <span>{t('demo.typing')}</span>
                </div>
              </div>
            </div>
            <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-5 text-muted-foreground">{t('demo.caption')}</p>
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              <p className="mb-4 text-sm font-bold tracking-wide text-primary">{t('eyebrow')}</p>
              <h2 className="text-balance font-display text-3xl font-bold leading-[1.12] tracking-[-0.03em] sm:text-4xl md:text-5xl">
                {t('title')}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{t('subtitle')}</p>
            </motion.div>

            <div className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = featureIcons[index] ?? MessagesSquare;
                return (
                  <motion.article
                    key={feature.title}
                    className={cn(
                      'flex items-start gap-3 rounded-2xl',
                      index === features.length - 1 && 'sm:col-span-2 sm:max-w-md',
                    )}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10"><Icon className="h-[1.1rem] w-[1.1rem] text-primary" aria-hidden="true" /></span>
                    <div><h3 className="font-bold leading-6">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{feature.description}</p></div>
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
