'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, Bot, Check, Cpu, LockKeyhole, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { MessengerWallpaper } from '@/components/landing/MessengerWallpaper';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('hero');
  const prefersReducedMotion = useReducedMotion();
  const proofItems = t.raw('proof') as string[];

  return (
    <section className="relative isolate overflow-hidden border-b px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:min-h-[calc(100vh-4rem)] lg:py-28">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_12%,hsl(var(--primary)/0.16),transparent_34%),radial-gradient(circle_at_84%_58%,hsl(var(--primary)/0.1),transparent_28%)]" />
      <MessengerWallpaper />

      <div className="container mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.65 }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-subtle px-3 py-1.5 text-sm font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t('eyebrow')}
          </div>

          <h1 className="font-display max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-7xl">
            {t('headline')}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {t('subheadline')}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/${locale}#lead-form`} className={buttonVariants({ size: 'lg', variant: 'cta' })}>
              {t('cta')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href={`/${locale}#features`} className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              {t('ctaSecondary')}
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {proofItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <Link
            href={`/${locale}/pricing`}
            className="mt-8 inline-flex text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            {t('existingUser')}
          </Link>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[520px]"
          initial={{ opacity: 0, scale: 0.96, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.75, delay: prefersReducedMotion ? 0 : 0.12 }}
          aria-hidden="true"
        >
          <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-primary-border bg-card/90 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.13),transparent_48%)]" />
            <div className="absolute inset-[16%] rounded-full border border-dashed border-primary/25" />
            <div className="absolute inset-[29%] rounded-full border border-primary/20" />

            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 text-xs font-medium shadow-sm sm:left-8 sm:top-8">
              <Cpu className="h-4 w-4 text-primary" />
              {t('visual.model')}
            </div>
            <div className="absolute right-5 top-[28%] flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 text-xs font-medium shadow-sm sm:right-8">
              <LockKeyhole className="h-4 w-4 text-primary" />
              {t('visual.private')}
            </div>
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 text-xs font-medium shadow-sm sm:bottom-8 sm:left-8">
              <WalletCards className="h-4 w-4 text-primary" />
              {t('visual.control')}
            </div>

            <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[2rem] border border-primary/30 bg-primary text-primary-foreground shadow-xl shadow-primary/25 sm:h-36 sm:w-36">
              <Bot className="h-10 w-10 sm:h-12 sm:w-12" />
              <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em]">{t('visual.core')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
