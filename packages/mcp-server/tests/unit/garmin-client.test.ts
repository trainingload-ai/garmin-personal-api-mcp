import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { TokenProvider } from '../../src/auth.js';
import { GarminClient } from '../../src/garmin-client.js';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => fs.rm(directory, { force: true, recursive: true })));
});

function jwt(exp: number): string {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
}

describe('GarminClient', () => {
  it('force-refreshes once after a 401 and retries the request once', async () => {
    const directory = await fs.mkdtemp(path.join(tmpdir(), 'garmin-mcp-client-'));
    directories.push(directory);
    let tokenCalls = 0;
    let dataCalls = 0;
    const fetch = vi.fn<typeof globalThis.fetch>((input) => {
      const url = requestUrl(input);
      if (url.includes('personal-api-key/token')) {
        tokenCalls += 1;
        return Promise.resolve(new Response(jwt(20_000 + tokenCalls), { status: 200 }));
      }
      dataCalls += 1;
      return Promise.resolve(dataCalls === 1
        ? new Response('expired', { status: 401 })
        : Response.json({ displayName: 'Synthetic Athlete' }));
    });
    const tokenProvider = new TokenProvider({
      apiKey: 'test-key',
      fetch,
      now: () => 1_000,
      settings: {
        apiKeyFile: path.join(directory, 'key'),
        baseUrl: 'https://garmin.test',
        timeoutMs: 1_000,
        tokenCacheFile: path.join(directory, 'token.json'),
      },
    });
    const client = new GarminClient({ fetch, tokenProvider });
    await expect(client.getJson('/profile')).resolves.toEqual({ displayName: 'Synthetic Athlete' });
    expect(tokenCalls).toBe(2);
    expect(dataCalls).toBe(2);
  });

  it('never retries more than once', async () => {
    const directory = await fs.mkdtemp(path.join(tmpdir(), 'garmin-mcp-client-'));
    directories.push(directory);
    const fetch = vi.fn<typeof globalThis.fetch>((input) =>
      Promise.resolve(
        requestUrl(input).includes('personal-api-key/token')
          ? new Response(jwt(20_000), { status: 200 })
          : new Response('no', { status: 401 }),
      ),
    );
    const tokenProvider = new TokenProvider({
      apiKey: 'test-key',
      fetch,
      now: () => 1_000,
      settings: {
        apiKeyFile: path.join(directory, 'key'),
        baseUrl: 'https://garmin.test',
        timeoutMs: 1_000,
        tokenCacheFile: path.join(directory, 'token.json'),
      },
    });
    await expect(new GarminClient({ fetch, tokenProvider }).getJson('/profile')).rejects.toMatchObject({
      code: 'garmin_unauthorized',
    });
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('preserves Garmin rate-limit retry guidance', async () => {
    const directory = await fs.mkdtemp(path.join(tmpdir(), 'garmin-mcp-client-'));
    directories.push(directory);
    const fetch = vi.fn<typeof globalThis.fetch>((input) =>
      Promise.resolve(
        requestUrl(input).includes('personal-api-key/token')
          ? new Response(jwt(20_000), { status: 200 })
          : new Response('{"message":"slow down"}', {
              headers: { 'retry-after': '15' },
              status: 429,
            }),
      ),
    );
    const tokenProvider = new TokenProvider({
      apiKey: 'test-key',
      fetch,
      now: () => 1_000,
      settings: {
        apiKeyFile: path.join(directory, 'key'),
        baseUrl: 'https://garmin.test',
        timeoutMs: 1_000,
        tokenCacheFile: path.join(directory, 'token.json'),
      },
    });

    await expect(new GarminClient({ fetch, tokenProvider }).getJson('/profile')).rejects
      .toMatchObject({
        code: 'garmin_rate_limited',
        retryAfterSeconds: 15,
        retryable: true,
        status: 429,
      });
  });
});

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  return input instanceof URL ? input.href : input.url;
}
