'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Zap, MessageSquare, Plug, Globe, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { servicesItems, servicesData } from '@/lib/data/services';

const icons = [Zap, MessageSquare, Plug, Globe, Wrench, Wrench];

interface ServicesBlockProps {
  locale: string;
}

export function ServicesBlock({ locale }: ServicesBlockProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="services" className="py-20 md:py-28 px-4 bg-accent/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {servicesData.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {servicesData.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesItems.map((item, index) => {
            const Icon = icons[index] || Zap;
            return (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
