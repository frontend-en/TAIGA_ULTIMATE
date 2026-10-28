'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { HeartHandshake, LifeBuoy, Puzzle } from 'lucide-react';

const icons = [HeartHandshake, Puzzle, LifeBuoy];
const accents = ['bg-primary/10', 'bg-[hsl(var(--friend-sage))]', 'bg-[hsl(var(--friend-lilac))]'];

export function WhyMeBlock() {
  const t = useTranslations('whyMe');
  const prefersReducedMotion = useReducedMotion();
  const items = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section className="px-4 pb-20 pt-2 sm:px-6 md:pb-24">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center">
          <p className="mb-4 text-sm font-bold tracking-wide text-primary">{t('eyebrow')}</p>
          <h2 className="text-balance font-display text-3xl font-bold leading-[1.12] tracking-[-0.03em] sm:text-4xl md:text-5xl">{t('title')}</h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = icons[index] ?? HeartHandshake;
            return (
              <motion.article
                key={item.title}
                className={`rounded-[2rem] p-7 sm:p-8 ${accents[index % accents.length]}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : index * 0.08 }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-background/70"><Icon className="h-6 w-6 text-foreground" aria-hidden="true" /></span>
                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
