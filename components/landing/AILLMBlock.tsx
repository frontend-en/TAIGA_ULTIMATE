'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Brain, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { aiCases, aiData } from '@/lib/data/ai';

interface AILLMBlockProps {
  locale: string;
}

export function AILLMBlock({ locale }: AILLMBlockProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {aiData.title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {aiData.intro}
            </p>
            <a
              href={`/${locale}#contact`}
              className={buttonVariants({ variant: 'cta', size: 'lg' })}
            >
              {aiData.cta}
            </a>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiCases.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-card border"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
