'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StickyCTAProps {
  locale: string;
}

export function StickyCTA({ locale }: StickyCTAProps) {
  const t = useTranslations('cta');
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (closed) return null;

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <div className="relative">
        <Button
          variant="cta"
          size="lg"
          className="shadow-lg rounded-full px-6"
          onClick={() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Send className="w-4 h-4" />
          {t('form.submit')}
        </Button>
        <button
          onClick={() => setClosed(true)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs hover:bg-accent transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
