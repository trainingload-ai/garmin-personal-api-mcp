import { getMessagesForLocale } from '@/i18n/messages';
import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';

import { canonicalUrl } from './url';

export function structuredDataForLocale(locale: Locale) {
  const copy = getMessagesForLocale(locale);
  const url = canonicalUrl(locale);
  const language = locale === 'zh' ? 'zh-CN' : 'en';

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url,
      description: copy.metadata.description,
      inLanguage: language,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: site.name,
      description: copy.metadata.description,
      codeRepository: site.github,
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Node.js 22+',
      license: `${site.github}/blob/main/LICENSE`,
      version: site.version,
      url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: site.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Windows, Linux',
      softwareVersion: site.version,
      isAccessibleForFree: true,
      downloadUrl: site.npm,
      description: copy.metadata.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url,
      inLanguage: language,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: copy.quickstart.title,
      description: copy.quickstart.description,
      totalTime: 'PT10M',
      tool: [{ '@type': 'HowToTool', name: 'Node.js 22+' }],
      step: [
        { '@type': 'HowToStep', position: 1, name: copy.quickstart.keyTitle, text: copy.quickstart.keyDescription },
        { '@type': 'HowToStep', position: 2, name: copy.quickstart.agentTitle, text: copy.quickstart.agentDescription },
        {
          '@type': 'HowToStep',
          position: 3,
          name: copy.quickstart.localTitle,
          text: `${copy.quickstart.localDescriptionBefore}127.0.0.1${copy.quickstart.localDescriptionAfter}`,
        },
        { '@type': 'HowToStep', position: 4, name: copy.quickstart.reloadTitle, text: copy.quickstart.reloadDescription },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ];
}

export function serializeStructuredData(locale: Locale): string {
  return JSON.stringify(structuredDataForLocale(locale)).replace(/</g, '\\u003c');
}
