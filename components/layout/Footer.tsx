import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { business } from '@/lib/site/business';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">{t('tagline')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              &copy; {new Date().getFullYear()} TAIGA_ULTIMATE. {t('copyright')}
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
            <a href={business.phoneHref} className="text-muted-foreground transition-colors hover:text-foreground">{t('phone')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
