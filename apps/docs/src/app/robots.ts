import type { MetadataRoute } from 'next';

import { site } from '../lib/site';

export const dynamic = 'force-static';

export const aiCrawlerUserAgents = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/'] },
      { userAgent: [...aiCrawlerUserAgents], allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${site.origin}/sitemap.xml`,
    host: site.origin,
  };
}
