import { describe, expect, it } from 'vitest';
import { zipSync } from 'fflate';

import { decodeActivityZip, toJsonSafe, uniformSample } from '../../src/fit.js';

describe('FIT helpers', () => {
  it('uniformly samples records while preserving both endpoints', () => {
    expect(uniformSample([0, 1, 2, 3, 4, 5, 6], 4)).toEqual([0, 2, 4, 6]);
    expect(uniformSample([1, 2], 5)).toEqual([1, 2]);
  });

  it('converts SDK values into JSON-safe values', () => {
    expect(
      toJsonSafe({ when: new Date('2026-01-01T00:00:00Z'), huge: 4n, invalid: Number.NaN }),
    ).toEqual({ when: '2026-01-01T00:00:00.000Z', huge: '4', invalid: null });
  });

  it('returns stable FIT errors for invalid archives', () => {
    expect(() => decodeActivityZip(new Uint8Array([1, 2, 3]))).toThrow('valid ZIP');
    expect(() => decodeActivityZip(zipSync({ 'readme.txt': new Uint8Array([1]) }))).toThrow(
      'did not contain a FIT file',
    );
  });
});
