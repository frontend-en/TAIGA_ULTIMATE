'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { processSteps, processData } from '@/lib/data/process';

interface ProcessBlockProps {
  locale: string;
}

export function ProcessBlock({ locale }: ProcessBlockProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="process" className="py-20 md:py-28 px-4 bg-accent/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {processData.title}
          </h2>
          <p className="text-lg text-muted-foreground">{processData.subtitle}</p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {processSteps.map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 4 && (
                  <ArrowRight className="hidden lg:block absolute top-7 -right-4 w-8 h-8 text-muted-foreground/50" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
