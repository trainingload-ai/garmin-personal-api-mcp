import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';

export function createOpenGraphImageUrl({
  description,
  locale,
  title,
}: {
  description: string;
  locale: Locale;
  title: string;
}): string {
  const url = new URL('/opengraph-image', site.origin);
  url.searchParams.set('locale', locale);
  url.searchParams.set('title', title);
  url.searchParams.set('description', description);

  return url.toString();
}
