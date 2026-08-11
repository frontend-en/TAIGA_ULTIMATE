'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LangSwitcher } from './LangSwitcher';

interface HeaderProps {
  locale: string;
}

function navItems(locale: string) {
  return [
    { key: 'features', href: `/${locale}#features` },
    { key: 'process', href: `/${locale}#process` },
    { key: 'services', href: `/${locale}#services` },
    { key: 'faq', href: `/${locale}#faq` },
    { key: 'pricing', href: `/${locale}/pricing` },
  ];
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href={`/${locale}`} className="mr-4 font-display text-base font-bold tracking-tight md:text-xl">
          TAIGA<span className="text-primary">_</span>ULTIMATE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
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
          <Link
            href={`/${locale}#lead-form`}
            className="hidden rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
          >
            {t('orderBot')}
          </Link>
          <button
            type="button"
            className="h-11 w-11 p-2 md:hidden"
            onClick={() => setMobileOpen((isOpen) => !isOpen)}
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-navigation" className="border-b md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            {navItems(locale).map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setMobileOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href={`/${locale}#lead-form`}
              className="inline-flex w-fit rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setMobileOpen(false)}
            >
              {t('orderBot')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
