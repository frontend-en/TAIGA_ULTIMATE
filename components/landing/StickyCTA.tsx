'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { MessageCircleHeart } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface StickyCTAProps {
  locale: string;
}

export function StickyCTA({ locale }: StickyCTAProps) {
  const t = useTranslations('cta');
  const navT = useTranslations('nav');
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [leadFormVisible, setLeadFormVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hero = document.querySelector('.friend-hero');
    if (!hero) {
      setHeroVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const leadForm = document.getElementById('lead-form');
    if (!leadForm) return;

    const observer = new IntersectionObserver(
      ([entry]) => setLeadFormVisible(entry.isIntersecting),
      { threshold: 0.08 }
    );
    observer.observe(leadForm);
    return () => observer.disconnect();
  }, []);

  if (closed) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 transition-all duration-300 motion-reduce:transition-none sm:bottom-6 sm:right-6',
        visible && !heroVisible && !leadFormVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-16 opacity-0',
        (heroVisible || leadFormVisible) && 'invisible',
      )}
    >
      <div className="relative">
        <Link href={`/${locale}#lead-form`} className={buttonVariants({ variant: 'cta', size: 'lg', className: 'rounded-full px-6 shadow-lg' })}>
          <MessageCircleHeart className="h-5 w-5" aria-hidden="true" />
          {navT('orderBot')}
        </Link>
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-muted text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('close')}
        >
          ×
        </button>
      </div>
    </div>
  );
}
