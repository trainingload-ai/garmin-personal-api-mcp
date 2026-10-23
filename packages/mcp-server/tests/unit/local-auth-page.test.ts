import { describe, expect, it, vi } from 'vitest';

import { GarminMcpError } from '../../src/errors.js';
import {
  detectLocalAuthLocale,
  isSupportedLocalAuthLocale,
  resolveLocalAuthLocale,
  startLocalAuthPage,
} from '../../src/local-auth-page.js';

describe('local authorization page', () => {
  it('serves a loopback-only form with restrictive browser headers', async () => {
    const session = await startLocalAuthPage({ locale: 'en', onSubmit: vi.fn() });
    try {
      const response = await fetch(session.url);
      const html = await response.text();

      expect(new URL(session.url).hostname).toBe('127.0.0.1');
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(html).toContain('Garmin Personal API key');
      expect(html).toContain('type="password"');
      expect(html).toContain('https://connect.garmin.com/app/settings/personalApiToken');
      expect(html).toContain('<html lang="en">');
    } finally {
      const rejected = expect(session.completion).rejects.toThrow('cancelled');
      await session.close();
      await rejected;
    }
  });

  it('rejects requests without the random authorization state', async () => {
    const session = await startLocalAuthPage({ locale: 'en', onSubmit: vi.fn() });
    try {
      const url = new URL(session.url);
      url.searchParams.set('state', 'wrong');
      const response = await fetch(url);
      expect(response.status).toBe(403);
    } finally {
      const rejected = expect(session.completion).rejects.toThrow('cancelled');
      await session.close();
      await rejected;
    }
  });

  it('validates the submitted key without echoing it and completes after success', async () => {
    const onSubmit = vi.fn<(key: string) => Promise<void>>().mockResolvedValue();
    const session = await startLocalAuthPage({ locale: 'en', onSubmit });
    const url = new URL(session.url);
    const apiKey = 'private-garmin-key';

    const response = await fetch(new URL('/authorize', url), {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: url.origin,
      },
      body: new URLSearchParams({ apiKey, state: url.searchParams.get('state') ?? '' }),
    });
    const html = await response.text();

    await session.completion;
    expect(response.status).toBe(200);
    expect(onSubmit).toHaveBeenCalledWith(apiKey);
    expect(html).toContain('Return to your AI client');
    expect(html).not.toContain(apiKey);
  });

  it('shows a safe error and allows a second submission', async () => {
    const onSubmit = vi
      .fn<(key: string) => Promise<void>>()
      .mockRejectedValueOnce(
        new GarminMcpError('credentials_invalid_or_expired', 'Garmin rejected this key.'),
      )
      .mockResolvedValueOnce();
    const session = await startLocalAuthPage({ locale: 'en', onSubmit });
    const url = new URL(session.url);
    const submit = (apiKey: string) => fetch(new URL('/authorize', url), {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: url.origin,
      },
      body: new URLSearchParams({ apiKey, state: url.searchParams.get('state') ?? '' }),
    });

    const first = await submit('wrong-key');
    expect(first.status).toBe(400);
    expect(await first.text()).toContain('Garmin rejected this key.');

    const second = await submit('valid-key');
    expect(second.status).toBe(200);
    await session.completion;
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('expires an abandoned authorization session', async () => {
    const session = await startLocalAuthPage({ locale: 'en', onSubmit: vi.fn(), timeoutMs: 10 });
    await expect(session.completion).rejects.toThrow('timed out');
  });

  it('keeps the selected language across the URL, switcher, form, and success state', async () => {
    const onSubmit = vi.fn<(key: string) => Promise<void>>().mockResolvedValue();
    const session = await startLocalAuthPage({ locale: 'zh', onSubmit });
    const url = new URL(session.url);

    expect(url.searchParams.get('lang')).toBe('zh');
    const page = await fetch(url);
    const html = await page.text();
    expect(html).toContain('<html lang="zh-CN">');
    expect(html).toContain('连接 Garmin Personal API');
    expect(html).toContain('lang=en&amp;state=');

    const response = await fetch(new URL('/authorize', url), {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: url.origin,
      },
      body: new URLSearchParams({
        apiKey: 'private-garmin-key',
        lang: 'zh',
        state: url.searchParams.get('state') ?? '',
      }),
    });
    const success = await response.text();

    await session.completion;
    expect(response.status).toBe(200);
    expect(success).toContain('Garmin 已连接');
    expect(success).not.toContain('private-garmin-key');
  });

  it('normalizes supported browser and system locales', () => {
    expect(resolveLocalAuthLocale('zh-CN')).toBe('zh');
    expect(resolveLocalAuthLocale('en_US')).toBe('en');
    expect(isSupportedLocalAuthLocale('zh-Hans')).toBe(true);
    expect(isSupportedLocalAuthLocale('fr')).toBe(false);
    expect(detectLocalAuthLocale({ LANG: 'zh_CN.UTF-8' })).toBe('zh');
    expect(detectLocalAuthLocale({ LANG: 'en_US.UTF-8' })).toBe('en');
  });
});
