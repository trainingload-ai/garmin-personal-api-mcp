import { describe, expect, it } from 'vitest';

import { getMessagesForLocale } from '@/i18n/messages';

const en = getMessagesForLocale('en');
const zh = getMessagesForLocale('zh');

describe('localized landing content', () => {
  it('keeps the English and Chinese message catalogs structurally aligned', () => {
    const collectKeys = (value: unknown, prefix = ''): string[] => {
      if (Array.isArray(value) || value === null || typeof value !== 'object') return [prefix];

      return Object.entries(value).flatMap(([key, child]) =>
        collectKeys(child, prefix ? `${prefix}.${key}` : key),
      );
    };

    expect(collectKeys(zh)).toEqual(collectKeys(en));
  });

  it.each([
    ['en', en],
    ['zh', zh],
  ] as const)('keeps Garmin Personal API prominent in %s', (_locale, copy) => {
    expect(copy.metadata.title).toContain('Garmin Personal API');
    expect(copy.metadata.description).toContain('Garmin Personal API');
    expect(copy.hero.eyebrow).toContain('Garmin Personal API');
    expect(copy.hero.description).toContain('Garmin Personal API');
    expect(copy.how.title).toContain('Garmin Personal API');
    expect(copy.projectFacts.title).toContain('Garmin Personal API');
    expect(copy.data.kicker).toContain('Garmin Personal API');
    expect(copy.faq.title).toContain('Garmin Personal API');
  });

  it('uses reader-friendly Chinese UI terms instead of untranslated implementation jargon', () => {
    const serialized = JSON.stringify(zh);

    expect(zh.nav.close).toBe('关闭');
    expect(zh.quickstart.docsOr).toBe('或');
    expect(zh.clients.windowsConfig).toBe('Windows MCP 配置');
    expect(zh.hero.description).not.toContain('stdio');
    expect(zh.hero.trust).toContain('完全本地运行');
    expect(zh.projectFacts.description).toContain('可核验');
    expect(serialized).not.toMatch(/\b(?:Agent|Host|bearer token)\b/);
  });
});
