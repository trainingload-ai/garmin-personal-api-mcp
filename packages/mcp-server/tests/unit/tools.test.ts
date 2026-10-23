import { describe, expect, it } from 'vitest';

import { mergeJsonChunks } from '../../src/tools/index.js';

describe('tool data merging', () => {
  it('merges arrays from automatic date chunks', () => {
    expect(mergeJsonChunks([[1, 2], [3]])).toEqual([1, 2, 3]);
  });

  it('merges Garmin data envelopes from automatic date chunks', () => {
    expect(
      mergeJsonChunks([
        { data: [{ date: '2026-01-01' }], status: 'ok' },
        { data: [{ date: '2026-02-01' }], status: 'ok' },
      ]),
    ).toEqual({
      data: [{ date: '2026-01-01' }, { date: '2026-02-01' }],
      status: 'ok',
    });
  });
});
