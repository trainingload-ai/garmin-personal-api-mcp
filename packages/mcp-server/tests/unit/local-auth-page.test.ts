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
      expect(response.headers.get('referrer-policy')).toBe('same-origin');
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(html).toContain('Personal API key');
      expect(html).toContain('type="password"');
      expect(html).toMatch(/action="\/authorize\?lang=en&amp;state=[^"]+"/);
      expect(html).toContain('https://connect.garmin.com/app/settings/personalApiToken');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('Choose authorization language');
      expect(html).toContain('lang=ja&amp;state=');
      expect(html).toContain('日本語');
      expect(html).toContain('한국어');
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
    expect(response.redirected).toBe(true);
    expect(new URL(response.url).pathname).toBe('/complete');
    expect(onSubmit).toHaveBeenCalledWith(apiKey);
    expect(html).toContain('Continue in your AI client');
    expect(html).toContain('Visit project website');
    expect(html).toContain('href="https://garminpersonalapi.com"');
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
    const submit = (apiKey: string) => fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'null',
      },
      body: new URLSearchParams({ apiKey, state: url.searchParams.get('state') ?? '' }),
    });

    const first = await submit('wrong-key');
    expect(first.status).toBe(400);
    expect(first.url).toContain('lang=en');
    const errorPage = await first.text();
    expect(errorPage).toContain('Key not verified');
    expect(errorPage).toContain('Garmin did not accept this Personal API key.');
    expect(errorPage).toContain('Verify another key');

    const second = await submit('valid-key');
    expect(second.status).toBe(200);
    await session.completion;
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('rejects a form submitted from a different non-opaque origin', async () => {
    const onSubmit = vi.fn<(key: string) => Promise<void>>().mockResolvedValue();
    const session = await startLocalAuthPage({ locale: 'en', onSubmit });
    try {
      const url = new URL(session.url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          origin: 'https://attacker.example',
        },
        body: new URLSearchParams({
          apiKey: 'private-garmin-key',
          state: url.searchParams.get('state') ?? '',
        }),
      });

      expect(response.status).toBe(403);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      const rejected = expect(session.completion).rejects.toThrow('cancelled');
      await session.close();
      await rejected;
    }
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
    expect(response.redirected).toBe(true);
    expect(new URL(response.url).pathname).toBe('/complete');
    expect(success).toContain('Garmin Personal API 已连接');
    expect(success).toContain('返回项目官网');
    expect(success).toContain('href="https://garminpersonalapi.com/zh"');
    expect(success).not.toContain('private-garmin-key');
  });

  it('does not expose the completion page before Garmin verification succeeds', async () => {
    const session = await startLocalAuthPage({ locale: 'en', onSubmit: vi.fn() });
    try {
      const url = new URL(session.url);
      const completionUrl = new URL('/complete', url);
      completionUrl.searchParams.set('lang', 'en');
      completionUrl.searchParams.set('state', url.searchParams.get('state') ?? '');

      const response = await fetch(completionUrl);
      const html = await response.text();

      expect(response.status).toBe(403);
      expect(html).toContain('This authorization link is invalid or has expired.');
      expect(html).not.toContain('Verification complete');
    } finally {
      const rejected = expect(session.completion).rejects.toThrow('cancelled');
      await session.close();
      await rejected;
    }
  });

  it('normalizes supported browser and system locales', () => {
    expect(resolveLocalAuthLocale('zh-CN')).toBe('zh');
    expect(resolveLocalAuthLocale('en_US')).toBe('en');
    expect(resolveLocalAuthLocale('ja_JP')).toBe('ja');
    expect(resolveLocalAuthLocale('es-MX')).toBe('es');
    expect(resolveLocalAuthLocale('de_DE.UTF-8')).toBe('de');
    expect(resolveLocalAuthLocale('fr_CA')).toBe('fr');
    expect(resolveLocalAuthLocale('pt-BR')).toBe('pt');
    expect(resolveLocalAuthLocale('ko_KR')).toBe('ko');
    expect(isSupportedLocalAuthLocale('zh-Hans')).toBe(true);
    expect(isSupportedLocalAuthLocale('fr')).toBe(true);
    expect(isSupportedLocalAuthLocale('it')).toBe(false);
    expect(detectLocalAuthLocale({ LANG: 'zh_CN.UTF-8' })).toBe('zh');
    expect(detectLocalAuthLocale({ LANG: 'en_US.UTF-8' })).toBe('en');
    expect(detectLocalAuthLocale({ LANGUAGE: 'pt_BR:en_US' })).toBe('pt');
  });

  it.each([
    ['en', 'en', 'Connect Garmin Personal API'],
    ['zh', 'zh-CN', '连接 Garmin Personal API'],
    ['ja', 'ja', 'Garmin Personal API に接続'],
    ['es', 'es', 'Conecta Garmin Personal API'],
    ['de', 'de', 'Garmin Personal API verbinden'],
    ['fr', 'fr', 'Connectez Garmin Personal API'],
    ['pt', 'pt', 'Conecte a Garmin Personal API'],
    ['ko', 'ko', 'Garmin Personal API 연결'],
  ] as const)('renders the complete %s authorization page', async (locale, htmlLanguage, heading) => {
    const session = await startLocalAuthPage({ locale, onSubmit: vi.fn() });
    try {
      const response = await fetch(session.url);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(new URL(session.url).searchParams.get('lang')).toBe(locale);
      expect(html).toContain(`<html lang="${htmlLanguage}">`);
      expect(html).toContain(heading);
      expect(html).toContain(`name="lang" value="${locale}"`);
    } finally {
      const rejected = expect(session.completion).rejects.toThrow('cancelled');
      await session.close();
      await rejected;
    }
  });
});
