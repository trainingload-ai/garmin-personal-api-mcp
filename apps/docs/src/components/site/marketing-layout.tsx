import type { ReactNode } from 'react';

import { getLandingMessages } from '@/i18n/get-messages';
import type { Locale } from '@/lib/content/types';

import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

export async function MarketingLayout({ children, locale }: { children: ReactNode; locale: Locale }) {
  const copy = await getLandingMessages();

  return (
    <>
      <a className="fixed top-2 left-2 z-50 -translate-y-[160%] rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0" href="#main-content">
        {copy.skipToContent}
      </a>
      <SiteHeader locale={locale} />
      <main id="main-content">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
