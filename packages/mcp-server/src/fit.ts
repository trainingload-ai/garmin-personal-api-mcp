import { Decoder, Stream } from '@garmin/fitsdk';
import { unzipSync } from 'fflate';

import { GarminMcpError } from './errors.js';
import type { JsonValue } from './garmin-client.js';
import { removePreciseLocation } from './privacy.js';

export type DecodedFit = {
  sessions: JsonValue[];
  laps: JsonValue[];
  records: JsonValue[];
  messageCounts: Record<string, number>;
  decodeErrors: number;
  integrity: boolean;
  totalRecords: number;
  sampling: string;
  truncated: boolean;
};

export function decodeActivityZip(
  zipBytes: Uint8Array,
  options: { includeLocation?: boolean; maxSamples?: number } = {},
): DecodedFit {
  const maxSamples = options.maxSamples ?? 300;
  if (!Number.isSafeInteger(maxSamples) || maxSamples < 1 || maxSamples > 5_000) {
    throw new GarminMcpError('invalid_input', 'max_samples must be between 1 and 5000.');
  }

  let fitBytes: Uint8Array | undefined;
  try {
    const files = unzipSync(zipBytes);
    const entry = Object.entries(files).find(([name]) => name.toLowerCase().endsWith('.fit'));
    fitBytes = entry?.[1];
  } catch (error) {
    throw new GarminMcpError('fit_decode_error', 'The Garmin activity download was not a valid ZIP file.', {
      cause: error,
    });
  }
  if (!fitBytes) {
    throw new GarminMcpError('fit_decode_error', 'The Garmin activity ZIP did not contain a FIT file.');
  }

  try {
    const stream = Stream.fromByteArray(Array.from(fitBytes));
    const decoder = new Decoder(stream);
    if (!decoder.isFIT()) {
      throw new GarminMcpError('fit_decode_error', 'The activity archive did not contain a valid FIT stream.');
    }
    const integrity = decoder.checkIntegrity();
    const decoded = decoder.read({
      applyScaleAndOffset: true,
      convertDateTimesToDates: true,
      convertTypesToStrings: true,
      expandComponents: true,
      expandSubFields: true,
      includeUnknownData: false,
      mergeHeartRates: true,
    });
    const messages = decoded.messages as Record<string, unknown>;
    const sessions = messageArray(messages, ['sessionMesgs', 'session']);
    const laps = messageArray(messages, ['lapMesgs', 'lap']);
    const records = messageArray(messages, ['recordMesgs', 'record']);
    const safeRecords = records.map((record) =>
      options.includeLocation ? toJsonSafe(record) : removePreciseLocation(toJsonSafe(record)),
    );
    const sampled = uniformSample(safeRecords, maxSamples);
    const counts = Object.fromEntries(
      Object.entries(messages).map(([key, value]) => [key, Array.isArray(value) ? value.length : 1]),
    );

    return {
      decodeErrors: decoded.errors.length,
      integrity,
      laps: laps.map((value) => toJsonSafe(value)),
      messageCounts: counts,
      records: sampled,
      sampling:
        records.length > sampled.length
          ? `uniformly sampled ${sampled.length} of ${records.length} records`
          : 'all records returned',
      sessions: sessions.map((value) => toJsonSafe(value)),
      totalRecords: records.length,
      truncated: records.length > sampled.length,
    };
  } catch (error) {
    if (error instanceof GarminMcpError) throw error;
    throw new GarminMcpError('fit_decode_error', 'Garmin FIT decoding failed.', { cause: error });
  }
}

export function uniformSample<T>(values: T[], maxSamples: number): T[] {
  if (values.length <= maxSamples) return [...values];
  if (maxSamples === 1) return [values[0] as T];
  return Array.from({ length: maxSamples }, (_, index) => {
    const position = Math.round((index * (values.length - 1)) / (maxSamples - 1));
    return values[position] as T;
  });
}

export function toJsonSafe(value: unknown): JsonValue {
  if (value === undefined) return null;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array) return Buffer.from(value).toString('base64');
  if (Array.isArray(value)) return value.map((entry) => toJsonSafe(entry));
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, toJsonSafe(child)]),
    );
  }
  if (typeof value === 'symbol') return value.description ?? 'symbol';
  if (typeof value === 'function') return '[function]';
  return null;
}

function messageArray(messages: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    if (Array.isArray(messages[key])) return messages[key];
  }
  return [];
}
