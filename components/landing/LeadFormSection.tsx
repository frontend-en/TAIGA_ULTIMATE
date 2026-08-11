'use client';

import { FormEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, CheckCircle2, Mail, Send, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { business } from '@/lib/site/business';

type FormStatus = 'idle' | 'sending' | 'success' | 'error' | 'rate-limited';

export function LeadFormSection({ locale }: { locale: string }) {
  const t = useTranslations('lead');
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      contact: String(form.get('contact') ?? ''),
      messenger: String(form.get('messenger') ?? ''),
      botPurpose: String(form.get('botPurpose') ?? ''),
      consent: form.get('consent') === 'on',
      website: String(form.get('website') ?? ''),
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        formRef.current?.reset();
        setStatus('success');
        return;
      }

      setStatus(response.status === 429 ? 'rate-limited' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="lead-form" className="scroll-mt-20 px-4 pb-24 pt-12 sm:px-6 md:pb-28">
      <div className="container mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-primary-border bg-[linear-gradient(135deg,hsl(var(--primary)/0.13),hsl(var(--card))_48%)] shadow-2xl shadow-primary/10">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative overflow-hidden border-b p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl md:text-5xl">{t('title')}</h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{t('subtitle')}</p>

              <div className="mt-9 space-y-4 text-sm text-muted-foreground">
                <p className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {t('privacyNote')}
                </p>
                <p className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    {t('directLabel')}{' '}
                    <a className="font-medium text-foreground underline underline-offset-4" href={`mailto:${business.email}`}>
                      {business.email}
                    </a>
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/75 p-6 backdrop-blur-sm sm:p-10 lg:p-12">
            {status === 'success' ? (
              <div role="status" aria-live="polite" className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{t('success.title')}</h3>
                <p className="mt-3 max-w-md leading-7 text-muted-foreground">{t('success.description')}</p>
                <Button className="mt-7" variant="outline" onClick={() => setStatus('idle')}>
                  {t('success.again')}
                </Button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-5"
                aria-busy={status === 'sending'}
              >
                <p className="sr-only" role="status" aria-live="polite">
                  {status === 'sending' ? t('sending') : ''}
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    <span>{t('fields.name.label')}</span>
                    <Input name="name" minLength={2} maxLength={80} required autoComplete="name" placeholder={t('fields.name.placeholder')} />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>{t('fields.contact.label')}</span>
                    <Input name="contact" minLength={3} maxLength={120} required autoComplete="email" placeholder={t('fields.contact.placeholder')} />
                  </label>
                </div>

                <label className="block space-y-2 text-sm font-medium">
                  <span>{t('fields.messenger.label')}</span>
                  <select
                    name="messenger"
                    required
                    defaultValue="max"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="max">MAX</option>
                    <option value="vk">VK</option>
                    <option value="other">{t('fields.messenger.other')}</option>
                  </select>
                </label>

                <label className="block space-y-2 text-sm font-medium">
                  <span>{t('fields.purpose.label')}</span>
                  <Textarea name="botPurpose" minLength={10} maxLength={1000} required className="min-h-32" placeholder={t('fields.purpose.placeholder')} />
                </label>

                <label className="hidden" aria-hidden="true">
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 rounded border-input accent-primary" />
                  <span>
                    {t('consent.prefix')}{' '}
                    <Link className="text-foreground underline underline-offset-4" href={`/${locale}/privacy`}>
                      {t('consent.link')}
                    </Link>
                  </span>
                </label>

                {status === 'error' && (
                  <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                    <p className="font-medium">{t('error.title')}</p>
                    <p className="mt-1 text-foreground/70">{t('error.description')}</p>
                    <a className="mt-2 inline-flex font-medium underline underline-offset-4" href={`mailto:${business.email}`}>
                      {t('error.email')}
                    </a>
                  </div>
                )}

                {status === 'rate-limited' && (
                  <div role="alert" className="rounded-xl border border-primary-border bg-primary-subtle p-4 text-sm">
                    {t('rateLimited')}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? t('sending') : t('submit')}
                  {status === 'sending' ? (
                    <Send className="h-4 w-4 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
