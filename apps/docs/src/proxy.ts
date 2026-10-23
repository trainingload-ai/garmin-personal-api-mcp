import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Next.js runs the proxy again for the internal `/` -> `/en` rewrite.
  // Let that internal request reach the route while still canonicalizing a public `/en` request to `/`.
  if (request.nextUrl.pathname === '/en' && request.headers.get('x-next-intl-locale') === 'en') {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|opengraph-image|.*\\..*).*)',
};
