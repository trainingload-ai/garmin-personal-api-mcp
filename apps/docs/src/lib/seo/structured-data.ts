import { getMessagesForLocale } from '@/i18n/messages';
import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';

import { canonicalUrl } from './url';

export function structuredDataForLocale(locale: Locale) {
  const copy = getMessagesForLocale(locale);
  const url = canonicalUrl(locale);
  const language = locale === 'zh' ? 'zh-CN' : 'en';
  const websiteId = `${site.origin}/#website`;
  const webpageId = `${url}#webpage`;
  const sourceCodeId = `${site.origin}/#source-code`;
  const applicationId = `${site.origin}/#software`;
  const publisher = {
    '@type': 'Organization',
    name: site.publisher,
    url: site.publisherGithub,
  };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: site.name,
      url: site.origin,
      description: site.description,
      inLanguage: ['en', 'zh-CN'],
      publisher,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': webpageId,
      name: copy.metadata.title,
      url,
      description: copy.metadata.description,
      inLanguage: language,
      isPartOf: { '@id': websiteId },
      about: { '@id': applicationId },
      mainEntity: { '@id': applicationId },
      citation: [site.garminPersonalApi, site.mcp, site.github, site.npm],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      '@id': sourceCodeId,
      name: site.name,
      description: copy.metadata.description,
      codeRepository: site.github,
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Node.js 22+',
      license: site.license,
      version: site.version,
      url: site.github,
      sameAs: [site.npm, site.origin],
      publisher,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': applicationId,
      name: site.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Windows, Linux',
      softwareVersion: site.version,
      softwareRequirements: 'Node.js 22 or newer and a local MCP-compatible AI client',
      isAccessibleForFree: true,
      downloadUrl: site.npm,
      description: copy.metadata.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: site.origin,
      inLanguage: language,
      featureList: copy.projectFacts.items.map((item) => item.value),
      sameAs: [site.github, site.npm],
      isBasedOn: site.garminPersonalApi,
      subjectOf: { '@id': sourceCodeId },
      publisher,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${url}#quickstart-schema`,
      name: copy.quickstart.title,
      description: copy.quickstart.description,
      url: `${url}#quickstart`,
      inLanguage: language,
      isPartOf: { '@id': webpageId },
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
      '@id': `${url}#faq-schema`,
      name: copy.faq.title,
      url: `${url}#faq`,
      inLanguage: language,
      isPartOf: { '@id': webpageId },
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
