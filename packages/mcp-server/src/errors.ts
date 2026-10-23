export const ERROR_CODES = [
  'credentials_missing',
  'credentials_invalid_or_expired',
  'garmin_unauthorized',
  'garmin_rate_limited',
  'garmin_no_data',
  'garmin_range_rejected',
  'garmin_upstream_error',
  'network_error',
  'fit_decode_error',
  'invalid_input',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export class GarminMcpError extends Error {
  readonly retryAfterSeconds: number | undefined;
  readonly retryable: boolean;
  readonly code: ErrorCode;
  readonly status: number | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      cause?: unknown;
      retryAfterSeconds?: number;
      retryable?: boolean;
      status?: number;
    },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'GarminMcpError';
    this.code = code;
    this.retryAfterSeconds = options?.retryAfterSeconds;
    this.retryable = options?.retryable ?? false;
    this.status = options?.status;
  }
}

export function redactSecrets(value: string, secrets: string[] = []): string {
  let redacted = value
    .replace(/(authorization\s*[:=]\s*)(?:bearer|apikey)\s+[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/(bearer|apikey)\s+[A-Za-z0-9._~+/=-]+/gi, '$1 [REDACTED]');

  for (const secret of secrets) {
    if (secret.length >= 4) redacted = redacted.split(secret).join('[REDACTED]');
  }

  return redacted.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 320);
}

export function fromHttpStatus(
  status: number,
  responseText = '',
  secrets: string[] = [],
  options: { retryAfter?: string | null; now?: () => number } = {},
): GarminMcpError {
  const detail = redactSecrets(responseText, secrets);
  const suffix = detail ? ` Garmin response: ${detail}` : '';

  if (status === 401 || status === 403) {
    return new GarminMcpError(
      'garmin_unauthorized',
      `Garmin rejected the credentials. Run "npx -y @trainingloadai/garmin-personal-api-mcp auth" and try again.${suffix}`,
      { status },
    );
  }
  if (status === 404) {
    return new GarminMcpError('garmin_no_data', `Garmin returned no data for this request.${suffix}`, {
      status,
    });
  }
  if (status === 400 || status === 422) {
    return new GarminMcpError(
      'garmin_range_rejected',
      `Garmin rejected the requested date range or arguments.${suffix}`,
      { status },
    );
  }
  if (status === 429) {
    const retryAfterSeconds = parseRetryAfter(options.retryAfter, options.now);
    const retry = retryAfterSeconds === undefined
      ? 'Wait a moment, narrow the date range, and retry.'
      : `Retry after ${retryAfterSeconds} seconds.`;
    return new GarminMcpError(
      'garmin_rate_limited',
      `Garmin rate-limited this request. ${retry}${suffix}`,
      {
        ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
        retryable: true,
        status,
      },
    );
  }
  if (status === 408) {
    return new GarminMcpError(
      'garmin_upstream_error',
      `Garmin timed out while handling the request. Retry later.${suffix}`,
      { retryable: true, status },
    );
  }
  const retryAfterSeconds = status >= 500
    ? parseRetryAfter(options.retryAfter, options.now)
    : undefined;
  return new GarminMcpError(
    'garmin_upstream_error',
    `Garmin returned HTTP ${status}.${status >= 500 ? ' Retry later.' : ''}${suffix}`,
    {
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
      retryable: status >= 500,
      status,
    },
  );
}

export function normalizeError(error: unknown): GarminMcpError {
  if (error instanceof GarminMcpError) return error;
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return new GarminMcpError(
      'network_error',
      'The Garmin Personal API request timed out. Check the connection and retry.',
      { cause: error, retryable: true },
    );
  }
  if (error instanceof TypeError) {
    return new GarminMcpError(
      'network_error',
      'Could not reach the Garmin Personal API. Check the network connection and retry.',
      { cause: error, retryable: true },
    );
  }
  const message = error instanceof Error ? redactSecrets(error.message) : 'Unexpected error';
  return new GarminMcpError('garmin_upstream_error', message, { cause: error });
}

function parseRetryAfter(
  value: string | null | undefined,
  now: (() => number) | undefined,
): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  const remaining = timestamp - (now?.() ?? Date.now());
  return Math.max(0, Math.ceil(remaining / 1000));
}
