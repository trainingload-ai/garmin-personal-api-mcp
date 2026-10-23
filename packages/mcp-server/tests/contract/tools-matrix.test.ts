import type { McpServer } from '@modelcontextprotocol/server';
import { describe, expect, it } from 'vitest';

import { GarminMcpError } from '../../src/errors.js';
import type { GarminGateway, JsonValue, QueryValue } from '../../src/garmin-client.js';
import { registerGarminTools, TOOL_NAMES } from '../../src/tools/index.js';

type Handler = (args: Record<string, unknown>) => Promise<{
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
}>;

class FakeGateway implements GarminGateway {
  calls: Array<{ params?: Record<string, QueryValue>; path: string }> = [];
  failPath: string | undefined;
  failWith: Error = new TypeError('synthetic failure');

  getJson(requestPath: string, params?: Record<string, QueryValue>): Promise<JsonValue> {
    this.calls.push({ ...(params ? { params } : {}), path: requestPath });
    if (this.failPath && requestPath.includes(this.failPath)) {
      return Promise.reject(this.failWith);
    }
    if (requestPath.includes('activities/search')) {
      return Promise.resolve([
        {
          activityId: 42,
          activityName: 'Synthetic run',
          averageHR: 150,
          latitude: 12.34,
          ignoredField: 'large value',
        },
      ]);
    }
    if (requestPath.includes('dailysummaries')) {
      return Promise.resolve({ data: [{ calendarDate: params?.startDate ?? '2026-10-01' }] });
    }
    if (requestPath.includes('bodyBattery')) {
      return Promise.resolve({ bodyBatteryValues: [[0, 80]], summary: { charged: 30 } });
    }
    if (requestPath.includes('/activity/42')) {
      return Promise.resolve({ activityId: 42, activityName: 'Synthetic', latitude: 1, longitude: 2 });
    }
    return Promise.resolve({ path: requestPath, params: toJson(params ?? {}) });
  }

  downloadActivity(): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array([1, 2, 3]));
  }
}

function registeredTools(gateway: GarminGateway) {
  const handlers = new Map<string, Handler>();
  const configs = new Map<string, Record<string, unknown>>();
  const fakeServer = {
    registerTool(name: string, config: Record<string, unknown>, handler: Handler) {
      handlers.set(name, handler);
      configs.set(name, config);
    },
  };
  registerGarminTools(fakeServer as unknown as McpServer, gateway);
  return { configs, handlers };
}

const args: Record<string, Record<string, unknown>> = {
  garmin_get_day: { date: '2026-10-01' },
  garmin_search_activities: {
    activity_type: 'running',
    end_date: '2026-10-02',
    limit: 1,
    start: 0,
    start_date: '2026-10-01',
  },
  garmin_get_activity: { activity_id: 42, include_location: false },
  garmin_get_activity_workouts: { activity_id: 42 },
  garmin_get_activity_recording: { activity_id: 42, include_location: false, max_samples: 300 },
  garmin_get_daily_summaries: { start_date: '2026-01-01', end_date: '2026-02-15' },
  garmin_get_sleep: { date: '2026-10-01' },
  garmin_get_sleep_summaries: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_hrv: { date: '2026-10-01', include_samples: false },
  garmin_get_hrv_summaries: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_body_battery: {
    start_date: '2026-10-01',
    end_date: '2026-10-02',
    include_samples: false,
  },
  garmin_get_stress: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_steps: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_hydration: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_heart_rate: { date: '2026-10-01', include_samples: false },
  garmin_get_spo2: { date: '2026-10-01', include_samples: false },
  garmin_get_wellness_activities: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_weight: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_weight_goals: { start_date: '2026-10-01', end_date: '2026-10-02' },
  garmin_get_food_log: { date: '2026-10-01' },
  garmin_get_profile: {},
  garmin_get_heart_rate_zones: {},
  garmin_get_fitness_age: { date: '2026-10-01' },
  garmin_get_menstrual_cycle: { date: '2026-10-01' },
  garmin_get_menstrual_day: { date: '2026-10-01', today_date: '2026-10-23' },
};

describe('complete tool matrix', () => {
  it('registers and executes every planned v0.1 tool', async () => {
    const { configs, handlers } = registeredTools(new FakeGateway());
    expect([...handlers.keys()]).toEqual(TOOL_NAMES);
    for (const name of TOOL_NAMES) {
      const config = configs.get(name);
      expect(config?.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: true });
      const result = await handlers.get(name)?.(args[name] ?? {});
      expect(result?.content[0]?.type).toBe('text');
      if (name === 'garmin_get_activity_recording') {
        expect(result?.isError).toBe(true);
      } else {
        expect(result?.isError).not.toBe(true);
        expect(result?.structuredContent).toHaveProperty('meta.source', 'garmin-personal-api');
      }
    }
  });

  it('reports get_day partial success and sample omission explicitly', async () => {
    const gateway = new FakeGateway();
    gateway.failPath = 'dailySleep';
    const { handlers } = registeredTools(gateway);
    const day = await handlers.get('garmin_get_day')?.({ date: '2026-10-01' });
    expect(day?.structuredContent).toHaveProperty('meta.partial', true);
    expect(day?.structuredContent).toHaveProperty('warnings.0');

    gateway.failPath = undefined;
    const battery = await handlers.get('garmin_get_body_battery')?.({
      start_date: '2026-10-01',
      end_date: '2026-10-01',
      include_samples: false,
    });
    expect(battery?.structuredContent).toHaveProperty('meta.truncated', true);
    expect(battery?.structuredContent).toHaveProperty('warnings.0');
  });

  it('does not hide authorization failures or a complete Garmin outage as partial data', async () => {
    const gateway = new FakeGateway();
    gateway.failPath = 'dailySleep';
    gateway.failWith = new GarminMcpError(
      'garmin_unauthorized',
      'Garmin rejected the credentials.',
      { status: 401 },
    );
    let handlers = registeredTools(gateway).handlers;
    const unauthorized = await handlers.get('garmin_get_day')?.({ date: '2026-10-01' });
    expect(unauthorized?.isError).toBe(true);
    expect(unauthorized?.content[0]?.text).toContain('garmin_unauthorized');

    gateway.failPath = '/';
    gateway.failWith = new TypeError('synthetic outage');
    handlers = registeredTools(gateway).handlers;
    const outage = await handlers.get('garmin_get_day')?.({ date: '2026-10-01' });
    expect(outage?.isError).toBe(true);
    expect(outage?.content[0]?.text).toContain('network_error');
  });

  it('keeps activity search compact and advertises the next offset', async () => {
    const { handlers } = registeredTools(new FakeGateway());
    const result = await handlers.get('garmin_search_activities')?.({ limit: 1, start: 0 });
    expect(result?.structuredContent).toHaveProperty('meta.nextOffset', 1);
    expect(result?.structuredContent).not.toHaveProperty('data.0.latitude');
    expect(result?.structuredContent).not.toHaveProperty('data.0.ignoredField');
  });

  it('rejects impossible calendar dates before calling Garmin', async () => {
    const { handlers } = registeredTools(new FakeGateway());
    const result = await handlers.get('garmin_get_sleep')?.({ date: '2026-02-30' });
    expect(result?.isError).toBe(true);
    expect(result?.content[0]?.text).toContain('invalid_input');
  });

  it('respects Garmin endpoint range limits without bursting concurrent requests', async () => {
    const gateway = new FakeGateway();
    const { handlers } = registeredTools(gateway);

    await handlers.get('garmin_get_steps')?.({
      start_date: '2026-01-01',
      end_date: '2026-01-29',
    });
    expect(gateway.calls.map(({ path }) => path)).toEqual([
      '/usersummary-service/stats/steps/daily/2026-01-01/2026-01-28',
      '/usersummary-service/stats/steps/daily/2026-01-29/2026-01-29',
    ]);

    gateway.calls.length = 0;
    await handlers.get('garmin_get_daily_summaries')?.({
      start_date: '2026-01-01',
      end_date: '2026-02-01',
    });
    expect(gateway.calls).toEqual([
      {
        params: { startDate: '2026-01-01', endDate: '2026-02-01' },
        path: '/usersummary-service/v2/dailysummaries',
      },
    ]);

    gateway.calls.length = 0;
    await handlers.get('garmin_get_hrv_summaries')?.({
      start_date: '2026-01-01',
      end_date: '2026-06-01',
    });
    expect(gateway.calls.map(({ path }) => path)).toEqual([
      '/hrv-service/hrv/daily/2026-01-01/2026-06-01',
    ]);
  });
});

function toJson(value: Record<string, QueryValue>): JsonValue {
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined),
  );
}
