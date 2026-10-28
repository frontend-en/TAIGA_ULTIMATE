'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowRight, Check, Heart, Lightbulb, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { MessengerWallpaper } from '@/components/landing/MessengerWallpaper';
import { FriendMascot } from '@/components/landing/FriendMascot';
import { cn } from '@/lib/utils';

interface HeroSectionProps { locale: string }
type Scenario = { label: string; user: string; bot: string };
const scenarioIcons = [Lightbulb, MessageCircle, Sparkles];

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('hero');
  const prefersReducedMotion = useReducedMotion();
  const [activeScenario, setActiveScenario] = useState(0);
  const proofItems = t.raw('proof') as string[];
  const scenarios = t.raw('playground.scenarios') as Scenario[];
  const scenario = scenarios[activeScenario];

  return (
    <section className="friend-hero relative isolate overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pt-16 lg:pb-12 lg:pt-20">
      <MessengerWallpaper />
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <motion.div className="relative z-10 pb-4 lg:pb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3.5 py-2 text-xs font-bold tracking-wide text-foreground sm:text-sm">
              <Heart className="h-4 w-4 fill-primary/20 text-primary" aria-hidden="true" />{t('eyebrow')}
            </div>
            <h1 className="font-display max-w-2xl text-[2.65rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-6xl xl:text-[4.65rem]">
              {t('headline')}{' '}<span className="friend-headline-accent relative inline-block text-primary">{t('headlineAccent')}</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{t('subheadline')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={`/${locale}#lead-form`} className={buttonVariants({ size: 'lg', variant: 'cta' })}>{t('cta')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href={`/${locale}#features`} className={buttonVariants({ size: 'lg', variant: 'outline' })}>{t('ctaSecondary')}</Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground sm:text-sm">
              {proofItems.map((item) => <li key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link href={`/${locale}/pricing`} className="mt-6 inline-flex text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground sm:text-sm">{t('existingUser')}</Link>
          </motion.div>
          <motion.div className="friend-playground relative mx-auto w-full max-w-[540px] pb-4 pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: prefersReducedMotion ? 0 : 0.1 }}>
            <div className="friend-scene relative h-[280px] sm:h-[320px]" aria-hidden="true">
              <div className="friend-scene__halo" />
              <div className="friend-scene__greeting">{t('playground.greeting')}<span className="friend-scene__greeting-tail" /></div>
              <Sparkles className="absolute left-[9%] top-[48%] h-8 w-8 rotate-12 text-primary/70" strokeWidth={1.5} />
              <Heart className="absolute right-[13%] top-[12%] h-8 w-8 -rotate-12 fill-primary/15 text-primary/60" strokeWidth={1.5} />
              <div className="friend-scene__mascot"><FriendMascot /></div>
              <span className="friend-scene__note">{t('playground.note')}</span>
            </div>
            <div className="relative -mt-3 rounded-[1.75rem] border border-foreground/10 bg-card p-4 shadow-xl sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="friend-mini-avatar" aria-hidden="true"><span /><span /></div>
                  <div><p className="text-sm font-extrabold">{t('playground.name')}</p><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />{t('playground.status')}</p></div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{t('playground.demo')}</span>
              </div>
              <div aria-live="polite" aria-atomic="true" className="min-h-[144px] space-y-3 sm:min-h-[130px]">
                <p className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm bg-secondary px-3.5 py-2.5 text-sm leading-6 text-secondary-foreground">{scenario.user}</p>
                <p className="mr-auto max-w-[94%] rounded-2xl rounded-bl-sm bg-primary-subtle px-3.5 py-2.5 text-sm leading-6">{scenario.bot}</p>
              </div>
              <p className="mb-2 mt-4 text-[11px] font-bold text-muted-foreground">{t('playground.try')}</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={t('playground.try')}>
                {scenarios.map((item, index) => {
                  const Icon = scenarioIcons[index] ?? Sparkles;
                  return <button key={item.label} type="button" aria-pressed={activeScenario === index} onClick={() => setActiveScenario(index)} className={cn('inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', activeScenario === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/40 hover:bg-primary-subtle')}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{item.label}</button>;
                })}
              </div>
            </div>
          </motion.div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-6 text-xs font-semibold text-muted-foreground lg:mt-6">
          <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />{t('messengerNote')}</span>
          <Link href={`/${locale}#features`} className="inline-flex items-center gap-2 transition-colors hover:text-primary">{t('scrollHint')}<ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
