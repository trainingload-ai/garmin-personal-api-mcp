import { TokenProvider } from './auth.js';
import { fromHttpStatus, GarminMcpError, normalizeError } from './errors.js';

export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type QueryValue = boolean | number | string | undefined;

export interface GarminGateway {
  downloadActivity(activityId: number): Promise<Uint8Array>;
  getJson(path: string, params?: Record<string, QueryValue>): Promise<JsonValue>;
}

type GarminClientOptions = {
  fetch?: typeof globalThis.fetch;
  tokenProvider?: TokenProvider;
};

export class GarminClient implements GarminGateway {
  readonly #fetch: typeof globalThis.fetch;
  readonly #tokens: TokenProvider;

  constructor(options: GarminClientOptions = {}) {
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#tokens = options.tokenProvider ?? new TokenProvider({ fetch: this.#fetch });
  }

  async getJson(path: string, params?: Record<string, QueryValue>): Promise<JsonValue> {
    const response = await this.#request(path, params, 'application/json');
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text.trim()) return null;
    try {
      return JSON.parse(text) as JsonValue;
    } catch (error) {
      throw new GarminMcpError(
        'garmin_upstream_error',
        'Garmin returned a successful response that was not valid JSON.',
        { cause: error },
      );
    }
  }

  async downloadActivity(activityId: number): Promise<Uint8Array> {
    if (!Number.isSafeInteger(activityId) || activityId <= 0) {
      throw new GarminMcpError('invalid_input', 'activity_id must be a positive integer.');
    }
    const response = await this.#request(
      `/download-service/files/activity/${activityId}`,
      undefined,
      'application/zip, application/x-zip-compressed, application/octet-stream',
    );
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0) {
      throw new GarminMcpError('garmin_no_data', 'Garmin returned an empty activity download.');
    }
    return bytes;
  }

  async #request(
    requestPath: string,
    params: Record<string, QueryValue> | undefined,
    accept: string,
  ): Promise<Response> {
    let token = await this.#tokens.getToken();
    let response = await this.#fetchOnce(requestPath, params, accept, token.accessToken);
    if (response.status === 401) {
      token = await this.#tokens.getToken({ forceRefresh: true });
      response = await this.#fetchOnce(requestPath, params, accept, token.accessToken);
    }
    if (!response.ok) {
      const summary = await response.text().catch(() => '');
      throw fromHttpStatus(response.status, summary, [token.accessToken], {
        retryAfter: response.headers.get('retry-after'),
      });
    }
    return response;
  }

  async #fetchOnce(
    requestPath: string,
    params: Record<string, QueryValue> | undefined,
    accept: string,
    accessToken: string,
  ): Promise<Response> {
    const url = new URL(`${this.#tokens.settings.baseUrl}${requestPath}`);
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    try {
      return await this.#fetch(url, {
        headers: { Accept: accept, Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(this.#tokens.settings.timeoutMs),
      });
    } catch (error) {
      throw normalizeError(error);
    }
  }
}
