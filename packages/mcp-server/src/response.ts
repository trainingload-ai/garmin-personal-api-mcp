import * as z from 'zod/v4';

import { normalizeError } from './errors.js';
import type { JsonValue } from './garmin-client.js';

export const envelopeSchema = z.object({
  data: z.json(),
  meta: z.object({
    source: z.literal('garmin-personal-api'),
    timezone: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    partial: z.boolean(),
    truncated: z.boolean(),
    returned: z.number().int().nonnegative().optional(),
    total: z.number().int().nonnegative().optional(),
    nextOffset: z.number().int().nonnegative().optional(),
    sampling: z.string().optional(),
  }),
  warnings: z.array(z.string()),
});

export type EnvelopeMeta = {
  startDate?: string;
  endDate?: string;
  partial?: boolean;
  truncated?: boolean;
  returned?: number;
  total?: number;
  nextOffset?: number;
  sampling?: string;
};

export type ToolEnvelope = {
  data: JsonValue;
  meta: {
    source: 'garmin-personal-api';
    timezone: string;
    partial: boolean;
    truncated: boolean;
  } & EnvelopeMeta;
  warnings: string[];
};

export function envelope(
  data: JsonValue,
  meta: EnvelopeMeta = {},
  warnings: string[] = [],
): ToolEnvelope {
  return {
    data,
    meta: {
      source: 'garmin-personal-api',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'local',
      partial: meta.partial ?? false,
      truncated: meta.truncated ?? false,
      ...meta,
    },
    warnings,
  };
}

export function successfulToolResult(result: ToolEnvelope) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }],
    structuredContent: { ...result },
  };
}

export function failedToolResult(error: unknown) {
  const normalized = normalizeError(error);
  const errorData = {
    code: normalized.code,
    message: normalized.message,
    retryable: normalized.retryable,
    ...(normalized.retryAfterSeconds === undefined
      ? {}
      : { retryAfterSeconds: normalized.retryAfterSeconds }),
    ...(normalized.status === undefined ? {} : { status: normalized.status }),
  };
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ error: errorData }),
      },
    ],
    isError: true as const,
  };
}
