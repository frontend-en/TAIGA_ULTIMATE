'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowRight, MessageCircleHeart, PartyPopper, Settings2 } from 'lucide-react';

const icons = [MessageCircleHeart, Settings2, PartyPopper];
const cardPalettes = [
  {
    surface: 'border-[#a9dabe] bg-[#c3f2d6] text-[#243c31] shadow-[0_6px_0_#a9dabe]',
    muted: 'text-[#40594c]',
    icon: 'bg-[#9ddfb7] text-[#243c31]',
  },
  {
    surface: 'border-[#c9b6e9] bg-[#e0d0ff] text-[#42305d] shadow-[0_6px_0_#c9b6e9]',
    muted: 'text-[#5e497b]',
    icon: 'bg-[#c4a5f0] text-[#42305d]',
  },
  {
    surface: 'border-[#a2c9e8] bg-[#c0e3ff] text-[#263e5b] shadow-[0_6px_0_#a2c9e8]',
    muted: 'text-[#405a78]',
    icon: 'bg-[#98c8ef] text-[#263e5b]',
  },
];

export function BotProcessSection() {
  const t = useTranslations('botProcess');
  const prefersReducedMotion = useReducedMotion();
  const steps = t.raw('steps') as Array<{ title: string; description: string }>;

  return (
    <section id="process" className="scroll-mt-24 bg-[hsl(var(--friend-butter))] px-4 py-20 text-[hsl(151_15%_19%)] sm:px-6 md:py-24">
      <div className="container mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-bold tracking-wide text-[hsl(151_15%_19%)]">{t('eyebrow')}</p>
          <h2 className="text-balance font-display text-3xl font-bold leading-[1.12] tracking-[-0.03em] text-[hsl(151_15%_19%)] sm:text-4xl md:text-5xl">{t('title')}</h2>
          <p className="mt-5 text-lg leading-8 text-[hsl(151_12%_27%)]">{t('subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = icons[index] ?? PartyPopper;
            const palette = cardPalettes[index % cardPalettes.length];
            return (
              <motion.article
                key={step.title}
                className={`relative rounded-[2rem] border p-7 sm:p-8 ${palette.surface}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.08 }}
              >
                <span className={`absolute right-7 top-7 font-display text-sm font-extrabold tracking-widest ${palette.muted}`}>0{index + 1}</span>
                <div className={`grid h-14 w-14 rotate-[-6deg] place-items-center rounded-[1.2rem] ${palette.icon}`}>
                  <Icon className="h-6 w-6 rotate-6" aria-hidden="true" />
                </div>
                <h3 className="mt-7 text-xl font-bold">{step.title}</h3>
                <p className={`mt-3 leading-7 ${palette.muted}`}>{step.description}</p>
                {index < steps.length - 1 && (
                  <><ArrowDown className="absolute -bottom-5 right-8 z-10 h-5 w-5 text-[hsl(151_15%_19%)] lg:hidden" aria-hidden="true" /><ArrowRight className="absolute -right-6 top-12 z-10 hidden h-6 w-6 text-[hsl(151_15%_19%)] lg:block" aria-hidden="true" /></>
                )}
              </motion.article>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-[hsl(151_12%_27%)]">{t('note')}</p>
      </div>
    </section>
  );
}
