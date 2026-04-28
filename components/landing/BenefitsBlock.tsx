'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { benefitsItems, benefitsData } from '@/lib/data/benefits';

interface BenefitsBlockProps {
  locale: string;
}

export function BenefitsBlock({ locale }: BenefitsBlockProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {benefitsData.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {benefitsItems.map((item, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-primary mb-2">
                {item.value}
              </div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
