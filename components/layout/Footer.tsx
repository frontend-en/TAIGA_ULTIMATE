import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { business, siteName } from '@/lib/site/business';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-foreground/10 bg-muted/40">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <Link href={`/${locale}`} className="mb-4 inline-flex items-center gap-2.5 font-display text-xl font-black tracking-tight"><span className="friend-mini-avatar" aria-hidden="true"><span /><span /></span><span>Sigma<span className="text-primary">Bots</span></span></Link>
            <p className="max-w-64 text-sm leading-6 text-muted-foreground">{t('tagline')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              &copy; {new Date().getFullYear()} {siteName}. {t('copyright')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            {[
              { href: `/${locale}/pricing`, key: 'pricing' },
              { href: `/${locale}/how-it-works`, key: 'howItWorks' },
              { href: `/${locale}/offer`, key: 'offer' },
              { href: `/${locale}/refunds`, key: 'refunds' },
              { href: `/${locale}/privacy`, key: 'privacy' },
              { href: `/${locale}/requisites`, key: 'requisites' },
            ].map((item) => (
              <Link key={item.key} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {t(item.key)}
              </Link>
            ))}
            <a href={`mailto:${business.email}`} className="text-muted-foreground transition-colors hover:text-foreground">{t('email')}</a>
            <a href={business.phoneHref} className="text-muted-foreground transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">
              {business.phone}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
