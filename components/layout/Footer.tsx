import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">{t('tagline')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              &copy; {new Date().getFullYear()} TAIGA_ULTIMATE. {t('copyright')}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/${locale}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === 'ru' ? 'Главная' : 'Home'}
            </Link>
            <Link
              href={`/${locale}#contact`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === 'ru' ? 'Контакты' : 'Contact'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
