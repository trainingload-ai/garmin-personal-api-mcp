import type { MetadataRoute } from 'next';

import { alternateLanguages } from '../lib/seo/url';
import { site } from '../lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = alternateLanguages();

  return [
    { url: `${site.origin}/`, changeFrequency: 'monthly', priority: 1, alternates: { languages } },
    { url: `${site.origin}/zh`, changeFrequency: 'monthly', priority: 0.9, alternates: { languages } },
  ];
}
