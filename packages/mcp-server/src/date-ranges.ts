import { GarminMcpError } from './errors.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export type DateRange = { startDate: string; endDate: string };

export function todayIso(now = new Date()): string {
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0')))
    .join('-');
}

export function parseIsoDate(value: string): Date {
  if (!ISO_DATE.test(value)) {
    throw new GarminMcpError('invalid_input', `Invalid date "${value}". Use YYYY-MM-DD.`);
  }
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new GarminMcpError('invalid_input', `Invalid calendar date "${value}".`);
  }
  return date;
}

export function normalizeDateRange(startDate?: string, endDate?: string): DateRange {
  const fallback = todayIso();
  const start = startDate ?? endDate ?? fallback;
  const end = endDate ?? startDate ?? fallback;
  const startValue = parseIsoDate(start).getTime();
  const endValue = parseIsoDate(end).getTime();
  if (startValue > endValue) {
    throw new GarminMcpError('invalid_input', 'start_date must be on or before end_date.');
  }
  return { startDate: start, endDate: end };
}

export function splitInclusiveRange(
  startDate: string,
  endDate: string,
  maxDays = 31,
): DateRange[] {
  if (!Number.isSafeInteger(maxDays) || maxDays < 1) {
    throw new GarminMcpError('invalid_input', 'maxDays must be a positive integer.');
  }
  const start = parseIsoDate(startDate).getTime();
  const end = parseIsoDate(endDate).getTime();
  if (start > end) {
    throw new GarminMcpError('invalid_input', 'start_date must be on or before end_date.');
  }

  const chunks: DateRange[] = [];
  for (let cursor = start; cursor <= end; cursor += maxDays * DAY_MS) {
    const chunkEnd = Math.min(end, cursor + (maxDays - 1) * DAY_MS);
    chunks.push({ startDate: toIso(cursor), endDate: toIso(chunkEnd) });
  }
  return chunks;
}

function toIso(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}
