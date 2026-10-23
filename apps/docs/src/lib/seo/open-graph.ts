import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';

export function createOpenGraphImageUrl(locale: Locale): string {
  return new URL(`/og/${locale}.png`, site.origin).toString();
}
