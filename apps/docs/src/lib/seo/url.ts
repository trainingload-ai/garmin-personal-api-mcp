import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';

export const languageTags = { en: 'en', zh: 'zh-CN', pt: 'pt-BR' } as const satisfies Record<Locale, string>;
export const openGraphLocales = { en: 'en_US', zh: 'zh_CN', pt: 'pt_BR' } as const satisfies Record<Locale, string>;

export function localePath(locale: Locale, hash = ''): string {
  return `${locale === 'en' ? '/' : `/${locale}`}${hash}`;
}

export function canonicalUrl(locale: Locale): string {
  return `${site.origin}${localePath(locale)}`;
}

export function alternateLanguages() {
  return {
    en: `${site.origin}/`,
    'zh-CN': `${site.origin}/zh`,
    'pt-BR': `${site.origin}/pt`,
    'x-default': `${site.origin}/`,
  } as const;
}
