export const siteOrigin = 'https://botguardthebest.ru';

export const supportedLocales = ['ru', 'en'] as const;
export type SiteLocale = (typeof supportedLocales)[number];

export const business = {
  legalName: 'ИП Ревякина Кристина Степановна',
  inn: '230608772037',
  ogrnip: '308236115500021',
  address: '353680, Краснодарский край, г. Ейск, ул. Мира, д. 198',
  email: 'kristinarwebdev@gmail.com',
  phone: '+7 989 210-64-59',
  phoneHref: 'tel:+79892106459',
  vat: 'без НДС',
} as const;

export function isSiteLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

export function localUrl(locale: SiteLocale, path = ''): string {
  return `${siteOrigin}/${locale}${path}`;
}
