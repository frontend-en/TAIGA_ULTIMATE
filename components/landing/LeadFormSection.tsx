'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { business } from '@/lib/site/business';
import { parseLead } from '@/lib/leads/validation';

type FormStatus = 'idle' | 'sending' | 'success' | 'error' | 'rate-limited' | 'pending' | 'rejected';
const fieldNames = ['name', 'contact', 'messenger', 'botPurpose', 'consent'] as const;
type FieldName = (typeof fieldNames)[number];
type FieldErrors = Partial<Record<FieldName, string>>;

const controlClassName = 'h-[3.25rem] rounded-2xl border-border bg-background/70 px-4 text-base shadow-sm placeholder:text-muted-foreground hover:border-foreground/25 focus:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:ring-offset-0 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20';

function retryDelay(response: Response) {
  const value = response.headers.get('Retry-After')?.trim();
  if (value && /^\d+$/.test(value)) return Math.min(Number(value), 86_400);
  if (value) {
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(0, Math.min(Math.ceil((date - Date.now()) / 1000), 86_400));
  }
  return response.status === 409 ? 2 : 60;
}

function readPayload(element: HTMLFormElement) {
  const form = new FormData(element);
  return {
    name: String(form.get('name') ?? ''),
    contact: String(form.get('contact') ?? ''),
    messenger: String(form.get('messenger') ?? ''),
    botPurpose: String(form.get('botPurpose') ?? ''),
    consent: form.get('consent') === 'on',
    website: String(form.get('website') ?? ''),
  };
}

export function LeadFormSection({ locale }: { locale: string }) {
  const t = useTranslations('lead');
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [retryUntil, setRetryUntil] = useState(0);
  const [clockNow, setClockNow] = useState(0);
  const submittingRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const retrySeconds = Math.max(0, Math.ceil((retryUntil - clockNow) / 1000));

  useEffect(() => {
    setHydrated(true);
    return () => requestRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!retryUntil) return;
    setClockNow(Date.now());
    const timer = setInterval(() => {
      const now = Date.now();
      setClockNow(now);
      if (now >= retryUntil) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [retryUntil]);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  function validate(element: HTMLFormElement) {
    const result = parseLead(readPayload(element));
    const errors: FieldErrors = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!fieldNames.includes(field) || errors[field]) continue;
        errors[field] = issue.code === 'too_big'
          ? t('validation.tooLong', { limit: String(issue.maximum) })
          : t(`validation.${field}`);
      }
    }

    return errors;
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    if (!hasSubmitted) return;
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const field = target.name as FieldName;
    if (!fieldNames.includes(field)) return;
    const errors = validate(event.currentTarget);
    setFieldErrors((current) => ({ ...current, [field]: errors[field] }));
  }

  function describedBy(field: FieldName, hint?: string) {
    return [hint, fieldErrors[field] ? `lead-${field}-error` : null].filter(Boolean).join(' ') || undefined;
  }

  function renderError(field: FieldName) {
    return fieldErrors[field] ? (
      <p id={`lead-${field}-error`} className="text-sm leading-5 text-destructive dark:text-red-400">
        {fieldErrors[field]}
      </p>
    ) : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated || submittingRef.current || retryUntil > Date.now()) return;
    setHasSubmitted(true);
    const errors = validate(event.currentTarget);
    setFieldErrors(errors);

    const firstInvalidField = fieldNames.find((field) => errors[field]);
    if (firstInvalidField) {
      const input = event.currentTarget.elements.namedItem(firstInvalidField);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    const payload = readPayload(event.currentTarget);
    submittingRef.current = true;
    setStatus('sending');
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (response.status === 200) {
        const body: unknown = await response.json().catch(() => null);
        if (typeof body !== 'object' || body === null || !('ok' in body) || body.ok !== true) {
          setStatus('error');
          return;
        }
        formRef.current?.reset();
        setStatus('success');
        return;
      }

      if (response.status === 400) {
        const body: unknown = await response.json().catch(() => null);
        const errors: FieldErrors = {};
        if (typeof body === 'object' && body !== null && 'fieldErrors' in body) {
          const submittedErrors = body.fieldErrors;
          if (typeof submittedErrors === 'object' && submittedErrors !== null) {
            for (const field of fieldNames) {
              if (field in submittedErrors && typeof (submittedErrors as Record<string, unknown>)[field] === 'string') errors[field] = t(`validation.${field}`);
            }
          }
        }
        setFieldErrors(errors);
        const field = fieldNames.find((name) => errors[name]);
        if (field) requestAnimationFrame(() => {
          const input = formRef.current?.elements.namedItem(field);
          if (input instanceof HTMLElement) input.focus();
        });
      }
      if (response.status === 409 || response.status === 429) {
        const now = Date.now();
        setClockNow(now);
        setRetryUntil(now + retryDelay(response) * 1000);
      }
      setStatus(response.status === 409 ? 'pending'
          : response.status === 422 ? 'rejected'
            : response.status === 429 ? 'rate-limited' : 'error');
    } catch {
      setStatus('error');
    } finally {
      clearTimeout(timeout);
      requestRef.current = null;
      submittingRef.current = false;
    }
  }

  return (
    <section id="lead-form" className="scroll-mt-20 px-4 pb-24 pt-12 sm:px-6 md:pb-28">
      <div className="container mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_24px_80px_-40px_hsl(var(--foreground)/0.2)] sm:rounded-[2.5rem]">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-between gap-8 border-b border-border/60 bg-primary/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
            <div>
              <p className="text-sm font-bold tracking-wide text-primary">{t('eyebrow')}</p>
              <h2 className="mt-6 text-balance font-display text-3xl font-bold leading-[1.1] tracking-[-0.04em] sm:text-4xl xl:text-5xl">{t('title')}</h2>
              <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{t('subtitle')}</p>
            </div>

              <div className="space-y-5 border-t border-border/80 pt-6 text-sm leading-6 text-muted-foreground lg:mt-10">
                <p className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {t('privacyNote')}
                </p>
                <p className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    {t('directLabel')}{' '}
                    <a className="break-all font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" href={`mailto:${business.email}`}>
                      {business.email}
                    </a>
                  </span>
                </p>
              </div>
          </div>

          <div className="bg-card p-6 sm:p-10 lg:p-10 xl:p-12">
            {status === 'success' ? (
              <div role="status" aria-live="polite" className="flex min-h-[34rem] flex-col items-center justify-center py-10 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-3xl border border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 ref={successRef} tabIndex={-1} className="mt-7 font-display text-3xl font-semibold tracking-tight outline-none">{t('success.title')}</h3>
                <p className="mt-3 max-w-md leading-7 text-muted-foreground">{t('success.description')}</p>
                <Button className="mt-8 h-12 rounded-xl px-6" variant="outline" onClick={() => {
                  setHasSubmitted(false);
                  setFieldErrors({});
                  setStatus('idle');
                  requestAnimationFrame(() => {
                    const input = formRef.current?.elements.namedItem('name');
                    if (input instanceof HTMLElement) input.focus();
                  });
                }}>
                  {t('success.again')}
                </Button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                onChange={handleChange}
                noValidate
                className="space-y-7"
                aria-busy={status === 'sending'}
                data-lead-ready={hydrated ? 'true' : 'false'}
              >
                <p className="sr-only" role="status" aria-live="polite">
                  {status === 'sending' ? t('sending') : ''}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">{t('requiredNote')}</p>
                {Object.values(fieldErrors).some(Boolean) && (
                  <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive dark:text-red-400">
                    {t('validation.summary')}
                  </p>
                )}

                <fieldset className="min-w-0 space-y-5" disabled={status === 'sending'}>
                  <legend className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t('groups.contact')}</legend>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <label htmlFor="lead-name" className="block text-sm font-medium">{t('fields.name.label')}</label>
                      <Input id="lead-name" name="name" minLength={2} maxLength={80} required autoComplete="name" className={controlClassName} placeholder={t('fields.name.placeholder')} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={describedBy('name')} />
                      {renderError('name')}
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="lead-contact" className="block text-sm font-medium">{t('fields.contact.label')}</label>
                      <Input id="lead-contact" name="contact" minLength={3} maxLength={120} required autoComplete="email" autoCapitalize="none" spellCheck={false} className={controlClassName} placeholder={t('fields.contact.placeholder')} aria-invalid={Boolean(fieldErrors.contact)} aria-describedby={describedBy('contact', 'lead-contact-hint')} />
                      <p id="lead-contact-hint" className="text-xs leading-5 text-muted-foreground">{t('fields.contact.hint')}</p>
                      {renderError('contact')}
                    </div>
                  </div>
                </fieldset>

                <fieldset className="min-w-0 space-y-5 border-t border-border/80 pt-6" disabled={status === 'sending'}>
                  <legend className="pr-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t('groups.bot')}</legend>
                  <div className="space-y-2.5">
                    <label htmlFor="lead-messenger" className="block text-sm font-medium">{t('fields.messenger.label')}</label>
                    <Input
                      id="lead-messenger"
                      name="messenger"
                      minLength={1}
                      maxLength={120}
                      required
                      className={controlClassName}
                      placeholder={t('fields.messenger.placeholder')}
                      aria-invalid={Boolean(fieldErrors.messenger)}
                      aria-describedby={describedBy('messenger', 'lead-messenger-hint')}
                    />
                    <p id="lead-messenger-hint" className="text-xs leading-5 text-muted-foreground">{t('fields.messenger.hint')}</p>
                    {renderError('messenger')}
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="lead-botPurpose" className="block text-sm font-medium">{t('fields.purpose.label')}</label>
                    <Textarea id="lead-botPurpose" name="botPurpose" minLength={10} maxLength={1000} required className={`${controlClassName} min-h-40 py-4 leading-7`} placeholder={t('fields.purpose.placeholder')} aria-invalid={Boolean(fieldErrors.botPurpose)} aria-describedby={describedBy('botPurpose', 'lead-purpose-hint')} />
                    <p id="lead-purpose-hint" className="text-xs leading-5 text-muted-foreground">{t('fields.purpose.hint')}</p>
                    {renderError('botPurpose')}
                  </div>
                </fieldset>

                <label className="hidden" aria-hidden="true">
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <div className="space-y-2.5">
                  <label className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border bg-background/50 p-4 text-sm leading-6 text-muted-foreground transition-colors ${fieldErrors.consent ? 'border-destructive/60 hover:border-destructive' : 'border-border/80 hover:border-foreground/25'}`}>
                    <input name="consent" type="checkbox" required disabled={status === 'sending'} aria-invalid={Boolean(fieldErrors.consent)} aria-describedby={describedBy('consent')} className="mt-0.5 h-5 w-5 shrink-0 rounded border-input accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
                    <span>
                      {t('consent.prefix')}{' '}
                      <Link className="text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" href={`/${locale}/privacy`}>
                        {t('consent.link')}
                      </Link>
                    </span>
                  </label>
                  {renderError('consent')}
                </div>

                {status === 'error' && (
                  <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive dark:text-red-400">
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

                {(status === 'pending' || status === 'rejected') && (
                  <div role="alert" className="rounded-xl border border-primary-border bg-primary-subtle p-4 text-sm">
                    {status === 'pending' ? t('pending') : t('rejected')}
                  </div>
                )}

                {retrySeconds > 0 && (
                  <p role="status" aria-live="polite" className="text-sm leading-6 text-muted-foreground">{t('retryAfter', { seconds: retrySeconds })}</p>
                )}

                <Button type="submit" size="lg" className="group h-14 w-full justify-between rounded-full px-5 text-base font-bold shadow-lg shadow-primary/15 hover:shadow-primary/25 sm:px-6" disabled={status === 'sending' || !hydrated || retrySeconds > 0}>
                  {status === 'sending' ? t('sending') : t('submit')}
                  {status === 'sending' ? (
                    <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
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
