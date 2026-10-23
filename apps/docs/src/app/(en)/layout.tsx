import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { RootDocument } from '@/components/root-document';
import { MarketingLayout } from '@/components/site/marketing-layout';
import { createLocalizedMetadata } from '@/lib/seo/metadata';
import '../global.css';

export const metadata: Metadata = createLocalizedMetadata('en');

export default function EnglishRootLayout({ children }: { children: ReactNode }) {
  setRequestLocale('en');

  return (
    <RootDocument locale="en">
      <MarketingLayout locale="en">{children}</MarketingLayout>
    </RootDocument>
  );
}
