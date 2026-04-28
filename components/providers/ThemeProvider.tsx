'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

export function ThemeProvider({
  children,
  locale,
  messages,
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & {
  locale: string;
  messages: AbstractIntlMessages;
}) {
  return (
    <NextThemesProvider {...props}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Moscow">
        {children}
      </NextIntlClientProvider>
    </NextThemesProvider>
  );
}
