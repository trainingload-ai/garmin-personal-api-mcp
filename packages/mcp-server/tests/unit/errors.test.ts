import { describe, expect, it } from 'vitest';

import { fromHttpStatus, normalizeError, redactSecrets } from '../../src/errors.js';

describe('error mapping', () => {
  it.each([
    [400, 'garmin_range_rejected'],
    [408, 'garmin_upstream_error'],
    [401, 'garmin_unauthorized'],
    [403, 'garmin_unauthorized'],
    [404, 'garmin_no_data'],
    [422, 'garmin_range_rejected'],
    [429, 'garmin_rate_limited'],
    [500, 'garmin_upstream_error'],
  ] as const)('maps HTTP %s to %s', (status, code) => {
    expect(fromHttpStatus(status, '<b>failure</b>')).toMatchObject({ code, status });
  });

  it('redacts headers and explicitly known secrets', () => {
    expect(redactSecrets('Authorization: Bearer abc.def secret-123', ['secret-123'])).toBe(
      'Authorization: [REDACTED] [REDACTED]',
    );
  });

  it('maps fetch failures to a stable network error', () => {
    expect(normalizeError(new TypeError('fetch failed'))).toMatchObject({
      code: 'network_error',
      retryable: true,
    });
  });

  it('maps request timeouts to a retryable network error', () => {
    const timeout = new Error('timed out');
    timeout.name = 'TimeoutError';
    expect(normalizeError(timeout)).toMatchObject({ code: 'network_error', retryable: true });
  });

  it('preserves a numeric Retry-After value for rate limits', () => {
    expect(fromHttpStatus(429, '{"message":"slow down"}', [], { retryAfter: '12' }))
      .toMatchObject({
        code: 'garmin_rate_limited',
        retryAfterSeconds: 12,
        retryable: true,
        status: 429,
      });
  });

  it('marks upstream timeouts and server failures as retryable', () => {
    expect(fromHttpStatus(408)).toMatchObject({ retryable: true, status: 408 });
    expect(fromHttpStatus(503, '', [], { retryAfter: '30' })).toMatchObject({
      retryAfterSeconds: 30,
      retryable: true,
      status: 503,
    });
  });
});
