import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { NextIntlClientProvider } from 'next-intl';

import { TooltipProvider } from '@/components/ui/tooltip';
import type { Locale } from '../lib/content/types';
import { inter } from '../lib/fonts';

export function RootDocument({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <html className={inter.variable} lang={locale === 'zh' ? 'zh-CN' : 'en'} suppressHydrationWarning>
      <body>
        <RootProvider theme={{ defaultTheme: 'system', disableTransitionOnChange: true, enableSystem: true }}>
          <NextIntlClientProvider locale={locale} messages={null}>
            <TooltipProvider>{children}</TooltipProvider>
          </NextIntlClientProvider>
        </RootProvider>
      </body>
    </html>
  );
}
