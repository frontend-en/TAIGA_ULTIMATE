'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LangSwitcher } from './LangSwitcher';

interface HeaderProps {
  locale: string;
}

function navItems(locale: string) {
  return [
    { key: 'home', href: `/${locale}` },
    { key: 'services', href: `/${locale}#services` },
    { key: 'faq', href: `/${locale}#faq` },
    { key: 'contact', href: `/${locale}#contact` },
  ];
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href={`/${locale}`} className="font-display text-md md:text-xl font-bold tracking-tight mr-4">
          TAIGA<span className="text-primary">_</span>ULTIMATE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems(locale).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          <LangSwitcher locale={locale} />
          <ThemeSwitcher />
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          mobileOpen ? 'max-h-64 border-b' : 'max-h-0'
        )}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
          {navItems(locale).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
