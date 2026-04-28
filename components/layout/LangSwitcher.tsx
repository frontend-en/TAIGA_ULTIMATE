'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LangSwitcherProps {
  locale: string;
}

const locales = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export function LangSwitcher({ locale }: LangSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      {locales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => switchLocale(loc.code)}
          className={cn(
            'px-2 py-1 text-xs font-medium rounded transition-colors',
            locale === loc.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={`Switch to ${loc.label}`}
        >
          {loc.label}
        </button>
      ))}
    </div>
  );
}
