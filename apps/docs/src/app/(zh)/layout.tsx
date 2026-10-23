import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { RootDocument } from '@/components/root-document';
import { MarketingLayout } from '@/components/site/marketing-layout';
import { createLocalizedMetadata } from '@/lib/seo/metadata';
import '../global.css';

export const metadata: Metadata = createLocalizedMetadata('zh');

export default function ChineseRootLayout({ children }: { children: ReactNode }) {
  setRequestLocale('zh');

  return (
    <RootDocument locale="zh">
      <MarketingLayout locale="zh">{children}</MarketingLayout>
    </RootDocument>
  );
}
