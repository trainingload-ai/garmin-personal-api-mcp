import { describe, expect, it } from 'vitest';

import { normalizeDateRange, parseIsoDate, splitInclusiveRange } from '../../src/date-ranges.js';

describe('date ranges', () => {
  it('validates real calendar dates and ordering', () => {
    expect(parseIsoDate('2024-02-29').toISOString()).toContain('2024-02-29');
    expect(() => parseIsoDate('2025-02-29')).toThrow('Invalid calendar date');
    expect(() => normalizeDateRange('2026-02-02', '2026-02-01')).toThrow(
      'start_date must be on or before end_date',
    );
  });

  it('normalizes one-sided ranges', () => {
    expect(normalizeDateRange('2026-10-01')).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-01',
    });
    expect(normalizeDateRange(undefined, '2026-10-03')).toEqual({
      startDate: '2026-10-03',
      endDate: '2026-10-03',
    });
  });

  it('splits inclusive ranges without gaps or overlaps', () => {
    expect(splitInclusiveRange('2026-01-01', '2026-03-05', 31)).toEqual([
      { startDate: '2026-01-01', endDate: '2026-01-31' },
      { startDate: '2026-02-01', endDate: '2026-03-03' },
      { startDate: '2026-03-04', endDate: '2026-03-05' },
    ]);
  });
});
