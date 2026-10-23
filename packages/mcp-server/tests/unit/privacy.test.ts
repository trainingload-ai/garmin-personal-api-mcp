import { describe, expect, it } from 'vitest';

import { omitHighFrequencySamples, removePreciseLocation } from '../../src/privacy.js';

describe('privacy filters', () => {
  it('removes nested coordinates and polylines by default', () => {
    expect(
      removePreciseLocation({
        activityId: 12,
        details: { latitude: 1.2, positionLong: 3.4, safe: 'kept' },
        polyline: 'secret-route',
      }),
    ).toEqual({ activityId: 12, details: { safe: 'kept' } });
  });

  it('reports sample omission instead of silently deleting data', () => {
    const filtered = omitHighFrequencySamples({
      summary: { restingHeartRate: 52 },
      heartRateValues: [[0, 70]],
    });
    expect(filtered).toEqual({ data: { summary: { restingHeartRate: 52 } }, omitted: true });
  });
});
