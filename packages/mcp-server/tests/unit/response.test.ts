import { describe, expect, it } from 'vitest';

import { GarminMcpError } from '../../src/errors.js';
import { envelope, failedToolResult, successfulToolResult } from '../../src/response.js';

describe('tool responses', () => {
  it('returns matching text and structured envelopes', () => {
    const value = envelope({ ok: true }, { returned: 1, total: 1 });
    const result = successfulToolResult(value);
    expect(result.structuredContent).toEqual(value);
    expect(JSON.parse(result.content[0]!.text)).toEqual(value);
  });

  it('returns stable readable tool errors without structured output', () => {
    const result = failedToolResult(new GarminMcpError(
      'garmin_rate_limited',
      'Try later',
      { retryAfterSeconds: 12, retryable: true, status: 429 },
    ));
    expect(result.isError).toBe(true);
    expect(JSON.parse(result.content[0]!.text)).toEqual({
      error: {
        code: 'garmin_rate_limited',
        message: 'Try later',
        retryAfterSeconds: 12,
        retryable: true,
        status: 429,
      },
    });
    expect(result).not.toHaveProperty('structuredContent');
  });
});
