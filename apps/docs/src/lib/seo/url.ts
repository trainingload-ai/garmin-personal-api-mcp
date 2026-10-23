import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';

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
    'x-default': `${site.origin}/`,
  } as const;
}
