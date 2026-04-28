'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface CTASectionProps {
  locale: string;
}

export function CTASection({ locale }: CTASectionProps) {
  const t = useTranslations('cta');
  const prefersReducedMotion = useReducedMotion();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: add zod validation + actual submission endpoint
    setStatus('success');
  };

  return (
    <section id="contact" className="py-20 md:py-28 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">{t('subtitle')}</p>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('or')}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://t.me/taiga_ultimate"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('telegram')}
                </a>
                <a
                  href="https://wa.me/79001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('whatsapp')}
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-lg border bg-primary/5 text-center">
                <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
                <p className="text-lg font-medium">{t('form.success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  type="text"
                  placeholder={t('form.name')}
                  required
                  className="w-full"
                  autoComplete="name"
                />
                <Input
                  type="text"
                  placeholder={t('form.contact')}
                  required
                  className="w-full"
                  autoComplete="email"
                />
                <Textarea
                  placeholder={t('form.message')}
                  required
                  className="w-full min-h-[120px]"
                />
                <Button type="submit" variant="cta" size="lg" className="w-full">
                  <Send className="w-4 h-4" />
                  {t('form.submit')}
                </Button>
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {t('form.error')}
                  </div>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
