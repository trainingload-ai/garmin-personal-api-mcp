import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import type { ReactNode } from 'react';

import { RootDocument } from '@/components/root-document';
import { MarketingLayout } from '@/components/site/marketing-layout';
import { routing } from '@/i18n/routing';
import { createLocalizedMetadata } from '@/lib/seo/metadata';
import '../global.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return createLocalizedMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <RootDocument locale={locale}>
      <MarketingLayout locale={locale}>{children}</MarketingLayout>
    </RootDocument>
  );
}
