import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { fromHttpStatus, GarminMcpError, normalizeError, redactSecrets } from './errors.js';
import { getRuntimeSettings, resolveApiKey, type RuntimeSettings } from './settings.js';

const TOKEN_PATH = '/personalapitoken-service/personal-api/personal-api-key/token';
const REFRESH_WINDOW_SECONDS = 60 * 60;

export type BearerToken = {
  accessToken: string;
  expiresAt: number;
};

type CachedToken = {
  fingerprint: string;
  access_token: string;
  expires_at: number;
};

type TokenProviderOptions = {
  apiKey?: string;
  env?: NodeJS.ProcessEnv;
  fetch?: typeof globalThis.fetch;
  homeDirectory?: string;
  now?: () => number;
  settings?: RuntimeSettings;
};

export class TokenProvider {
  readonly settings: RuntimeSettings;
  readonly #env: NodeJS.ProcessEnv;
  readonly #apiKey: string | undefined;
  readonly #apiKeyProvided: boolean;
  readonly #fetch: typeof globalThis.fetch;
  readonly #homeDirectory: string | undefined;
  readonly #inFlightExchanges = new Map<string, Promise<BearerToken>>();
  readonly #now: () => number;

  constructor(options: TokenProviderOptions = {}) {
    this.#env = options.env ?? process.env;
    this.#apiKey = options.apiKey;
    this.#apiKeyProvided = options.apiKey !== undefined;
    this.#homeDirectory = options.homeDirectory;
    this.settings =
      options.settings ?? getRuntimeSettings(this.#env, options.homeDirectory ?? undefined);
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#now = options.now ?? (() => Date.now() / 1000);
  }

  async getToken(options: { apiKey?: string; forceRefresh?: boolean } = {}): Promise<BearerToken> {
    const explicitApiKey = options.apiKey !== undefined
      ? options.apiKey
      : this.#apiKeyProvided
        ? this.#apiKey
        : undefined;
    const apiKey = explicitApiKey === undefined
      ? (await resolveApiKey(this.#env, this.#homeDirectory)).key
      : explicitApiKey.trim();
    if (!apiKey) {
      throw new GarminMcpError(
        'credentials_missing',
        'The explicit Garmin Personal API key is empty. Create a current key and run the auth command again.',
      );
    }
    const fingerprint = createHash('sha256')
      .update(`${this.settings.baseUrl}\0${apiKey}`)
      .digest('hex');

    if (!options.forceRefresh) {
      const cached = await this.#readCache(fingerprint);
      if (cached && cached.expiresAt - this.#now() > REFRESH_WINDOW_SECONDS) return cached;
    }

    const activeExchange = this.#inFlightExchanges.get(fingerprint);
    if (activeExchange) return activeExchange;

    const exchange = this.#exchange(apiKey, fingerprint);
    this.#inFlightExchanges.set(fingerprint, exchange);
    try {
      return await exchange;
    } finally {
      if (this.#inFlightExchanges.get(fingerprint) === exchange) {
        this.#inFlightExchanges.delete(fingerprint);
      }
    }
  }

  async #exchange(apiKey: string, fingerprint: string): Promise<BearerToken> {
    let response: Response;
    try {
      response = await this.#fetch(`${this.settings.baseUrl}${TOKEN_PATH}`, {
        method: 'POST',
        headers: { Accept: '*/*', Authorization: `ApiKey ${apiKey}` },
        signal: AbortSignal.timeout(this.settings.timeoutMs),
      });
    } catch (error) {
      throw normalizeError(error);
    }
    const responseText = await response.text();
    if (!response.ok) {
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const detail = redactSecrets(responseText, [apiKey]);
        throw new GarminMcpError(
          'credentials_invalid_or_expired',
          `Garmin rejected the Personal API key. It may be invalid, expired, or deleted. Create a current key and run "npx -y @trainingloadai/garmin-personal-api-mcp auth" again.${detail ? ` Garmin response: ${detail}` : ''}`,
          { status: response.status },
        );
      }
      throw fromHttpStatus(response.status, responseText, [apiKey], {
        retryAfter: response.headers.get('retry-after'),
      });
    }

    const accessToken = responseText.trim();
    const expiresAt = decodeJwtExpiration(accessToken);
    const token = { accessToken, expiresAt };
    await this.#writeCache({
      access_token: accessToken,
      expires_at: expiresAt,
      fingerprint,
    });
    return token;
  }

  async #readCache(fingerprint: string): Promise<BearerToken | undefined> {
    try {
      const parsed = JSON.parse(await fs.readFile(this.settings.tokenCacheFile, 'utf8')) as Partial<CachedToken>;
      if (
        parsed.fingerprint !== fingerprint ||
        typeof parsed.access_token !== 'string' ||
        typeof parsed.expires_at !== 'number'
      ) {
        return undefined;
      }
      return { accessToken: parsed.access_token, expiresAt: parsed.expires_at };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT' || error instanceof SyntaxError) return undefined;
      throw new GarminMcpError(
        'credentials_invalid_or_expired',
        `Could not read bearer-token cache: ${this.settings.tokenCacheFile}. Fix its permissions or remove it, then retry.`,
        { cause: error },
      );
    }
  }

  async #writeCache(cache: CachedToken): Promise<void> {
    const cacheDirectory = path.dirname(this.settings.tokenCacheFile);
    try {
      await fs.mkdir(cacheDirectory, { mode: 0o700, recursive: true });
      await fs.chmod(cacheDirectory, 0o700).catch(() => undefined);
      await fs.writeFile(this.settings.tokenCacheFile, JSON.stringify(cache), {
        encoding: 'utf8',
        mode: 0o600,
      });
      await fs.chmod(this.settings.tokenCacheFile, 0o600).catch(() => undefined);
    } catch (error) {
      throw new GarminMcpError(
        'credentials_invalid_or_expired',
        `Could not write bearer-token cache: ${this.settings.tokenCacheFile}. Check the directory permissions and retry.`,
        { cause: error },
      );
    }
  }
}

export function decodeJwtExpiration(token: string): number {
  try {
    const payload = token.split('.')[1];
    if (!payload) throw new Error('missing JWT payload');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: unknown };
    if (typeof decoded.exp !== 'number' || !Number.isFinite(decoded.exp)) throw new Error('missing exp');
    return decoded.exp;
  } catch (error) {
    throw new GarminMcpError(
      'credentials_invalid_or_expired',
      'Garmin token response was not a JWT with a valid exp claim.',
      { cause: error },
    );
  }
}
