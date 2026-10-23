import type { Metadata } from 'next';

import { getMessagesForLocale } from '@/i18n/messages';
import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';

import { createOpenGraphImageUrl } from './open-graph';
import { alternateLanguages, canonicalUrl } from './url';

export function createLocalizedMetadata(locale: Locale): Metadata {
  const copy = getMessagesForLocale(locale);
  const canonical = canonicalUrl(locale);
  const imageUrl = createOpenGraphImageUrl({
    description: copy.metadata.description,
    locale,
    title: copy.metadata.title,
  });
  const image = {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: copy.metadata.title,
  };

  return {
    metadataBase: new URL(site.origin),
    applicationName: site.name,
    title: {
      default: copy.metadata.title,
      template: `%s | ${site.shortName}`,
    },
    description: copy.metadata.description,
    keywords: copy.metadata.keywords,
    authors: [{ name: `${site.publisher} contributors`, url: site.github }],
    creator: site.publisher,
    publisher: site.publisher,
    category: 'technology',
    alternates: {
      canonical,
      languages: alternateLanguages(),
    },
    icons: { icon: '/icon.svg' },
    openGraph: {
      type: 'website',
      url: canonical,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      siteName: site.name,
      title: copy.metadata.title,
      description: copy.metadata.description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.metadata.title,
      description: copy.metadata.description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}
