import { describe, expect, it } from 'vitest';

import { routing } from './routing';

describe('next-intl routing', () => {
  it('uses only URL-based locale selection for the two public locales', () => {
    expect(routing.locales).toEqual(['en', 'zh']);
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('as-needed');
    expect(routing.localeDetection).toBe(false);
    expect(routing.localeCookie).toBe(false);
    expect(routing.alternateLinks).toBe(false);
  });
});
