import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { getMessagesForLocale } from '@/i18n/messages';

import { createLocalizedMetadata } from './metadata';
import { createOpenGraphImageUrl } from './open-graph';
import { serializeStructuredData, structuredDataForLocale } from './structured-data';
import { alternateLanguages, canonicalUrl, localePath } from './url';

describe('localized URLs', () => {
  it('keeps the public locale and anchor contract', () => {
    expect(localePath('en')).toBe('/');
    expect(localePath('en', '#quickstart')).toBe('/#quickstart');
    expect(localePath('zh')).toBe('/zh');
    expect(localePath('zh', '#privacy')).toBe('/zh#privacy');
  });

  it('builds canonical and hreflang URLs for only the two public pages', () => {
    expect(canonicalUrl('en')).toBe('https://garminpersonalapi.com/');
    expect(canonicalUrl('zh')).toBe('https://garminpersonalapi.com/zh');
    expect(alternateLanguages()).toEqual({
      en: 'https://garminpersonalapi.com/',
      'zh-CN': 'https://garminpersonalapi.com/zh',
      'x-default': 'https://garminpersonalapi.com/',
    });
  });
});

describe('localized metadata', () => {
  it.each(['en', 'zh'] as const)('includes canonical, hreflang, Open Graph, Twitter, and robots for %s', (locale) => {
    const metadata = createLocalizedMetadata(locale);
    const copy = getMessagesForLocale(locale);
    const imageUrl = createOpenGraphImageUrl(locale);

    expect(metadata.alternates).toEqual({
      canonical: canonicalUrl(locale),
      languages: alternateLanguages(),
    });
    expect(metadata.openGraph).toMatchObject({
      url: canonicalUrl(locale),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: copy.metadata.title }],
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', images: [{ url: imageUrl }] });
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 },
    });
  });

  it('uses a pre-rendered Open Graph image for each locale', () => {
    expect(createOpenGraphImageUrl('en')).toBe('https://garminpersonalapi.com/og/en.png');
    expect(createOpenGraphImageUrl('zh')).toBe('https://garminpersonalapi.com/og/zh.png');
  });
});

describe('structured data', () => {
  it.each(['en', 'zh'] as const)('shares visible HowTo and FAQ content for %s', (locale) => {
    const schemas = structuredDataForLocale(locale);
    const copy = getMessagesForLocale(locale);
    const howTo = schemas.find((schema) => schema['@type'] === 'HowTo');
    const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');

    expect(schemas.map((schema) => schema['@type'])).toEqual([
      'WebSite',
      'SoftwareSourceCode',
      'SoftwareApplication',
      'HowTo',
      'FAQPage',
    ]);
    expect(howTo).toMatchObject({ name: copy.quickstart.title });
    expect(howTo).toHaveProperty('step', expect.arrayContaining([
      expect.objectContaining({ name: copy.quickstart.keyTitle }),
      expect.objectContaining({ name: copy.quickstart.reloadTitle }),
    ]));
    expect(faq).toHaveProperty(
      'mainEntity',
      copy.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    );
  });

  it('escapes tag-like content before embedding JSON in HTML', () => {
    expect(serializeStructuredData('en')).not.toContain('<');
  });
});

describe('crawl surface', () => {
  it('publishes only the English and Chinese homepage URLs', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      'https://garminpersonalapi.com/',
      'https://garminpersonalapi.com/zh',
    ]);
    expect(robots()).toMatchObject({
      host: 'https://garminpersonalapi.com',
      sitemap: 'https://garminpersonalapi.com/sitemap.xml',
    });
  });
});
