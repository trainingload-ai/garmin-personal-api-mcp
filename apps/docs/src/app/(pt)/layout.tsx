import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { RootDocument } from '@/components/root-document';
import { MarketingLayout } from '@/components/site/marketing-layout';
import { createLocalizedMetadata } from '@/lib/seo/metadata';
import '../global.css';

export const metadata: Metadata = createLocalizedMetadata('pt');

export default function PortugueseRootLayout({ children }: { children: ReactNode }) {
  setRequestLocale('pt');

  return (
    <RootDocument locale="pt">
      <MarketingLayout locale="pt">{children}</MarketingLayout>
    </RootDocument>
  );
}
