import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { decodeJwtExpiration, TokenProvider } from '../../src/auth.js';
import type { RuntimeSettings } from '../../src/settings.js';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => fs.rm(directory, { force: true, recursive: true })));
});

function jwt(exp: number): string {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
}

async function settings(): Promise<RuntimeSettings> {
  const directory = await fs.mkdtemp(path.join(tmpdir(), 'garmin-mcp-auth-'));
  directories.push(directory);
  return {
    apiKeyFile: path.join(directory, 'key'),
    baseUrl: 'https://garmin.test',
    timeoutMs: 1000,
    tokenCacheFile: path.join(directory, 'token.json'),
  };
}

describe('TokenProvider', () => {
  it('decodes the JWT expiration claim', () => {
    expect(decodeJwtExpiration(jwt(12345))).toBe(12345);
    expect(() => decodeJwtExpiration('not-a-jwt')).toThrow('valid exp claim');
  });

  it('reuses a compatible cached token with more than one hour remaining', async () => {
    const runtime = await settings();
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(jwt(10_000), { status: 200 }),
    );
    const provider = new TokenProvider({ apiKey: 'key-one', fetch, now: () => 1_000, settings: runtime });
    expect((await provider.getToken()).expiresAt).toBe(10_000);
    expect((await provider.getToken()).expiresAt).toBe(10_000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not reuse a token for a different API key', async () => {
    const runtime = await settings();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response(jwt(10_000), { status: 200 }))
      .mockResolvedValueOnce(new Response(jwt(11_000), { status: 200 }));
    await new TokenProvider({ apiKey: 'key-one', fetch, now: () => 1_000, settings: runtime }).getToken();
    await new TokenProvider({ apiKey: 'key-two', fetch, now: () => 1_000, settings: runtime }).getToken();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent token exchanges for the same key', async () => {
    const runtime = await settings();
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(jwt(10_000), { status: 200 }),
    );
    const provider = new TokenProvider({ apiKey: 'key-one', fetch, now: () => 1_000, settings: runtime });

    const tokens = await Promise.all([
      provider.getToken(),
      provider.getToken(),
      provider.getToken(),
    ]);

    expect(tokens.map((token) => token.accessToken)).toEqual([
      jwt(10_000),
      jwt(10_000),
      jwt(10_000),
    ]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('treats token endpoint 400 responses as a rejected key without exposing the key', async () => {
    const runtime = await settings();
    const apiKey = 'private-key-value';
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(`invalid ${apiKey}`, { status: 400 }),
    );
    const provider = new TokenProvider({ apiKey, fetch, settings: runtime });

    const rejection = expect(provider.getToken()).rejects;
    await rejection.toMatchObject({ code: 'credentials_invalid_or_expired', status: 400 });
    await rejection.not.toThrow(apiKey);
  });

  it('rejects an explicitly empty key instead of falling back to another source', async () => {
    const runtime = await settings();
    const provider = new TokenProvider({
      apiKey: ' ',
      env: { GARMIN_PERSONAL_API_KEY: 'fallback-key' },
      settings: runtime,
    });

    await expect(provider.getToken()).rejects.toMatchObject({ code: 'credentials_missing' });
  });
});
