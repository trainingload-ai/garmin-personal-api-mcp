import type { JsonValue } from './garmin-client.js';

const LOCATION_KEYS = new Set([
  'latitude',
  'longitude',
  'positionlat',
  'positionlong',
  'startlatitude',
  'startlongitude',
  'endlatitude',
  'endlongitude',
  'startlat',
  'startlon',
  'endlon',
  'endlat',
  'polyline',
  'encodedpolyline',
  'geojson',
  'coordinates',
]);

const SAMPLE_KEYS = new Set([
  'samples',
  'heartratesamples',
  'heartratevalues',
  'hrvalues',
  'spo2values',
  'spo2samples',
  'bodybatteryvalues',
  'bodybatterysamples',
  'stressvalues',
  'stresssamples',
  'measurementvalues',
]);

export function removePreciseLocation(value: JsonValue): JsonValue {
  return filterKeys(value, LOCATION_KEYS);
}

export function omitHighFrequencySamples(value: JsonValue): {
  data: JsonValue;
  omitted: boolean;
} {
  let omitted = false;
  const data = filterKeys(value, SAMPLE_KEYS, () => {
    omitted = true;
  });
  return { data, omitted };
}

function filterKeys(value: JsonValue, blocked: Set<string>, onOmit?: () => void): JsonValue {
  if (Array.isArray(value)) return value.map((entry) => filterKeys(entry, blocked, onOmit));
  if (value === null || typeof value !== 'object') return value;

  const output: Record<string, JsonValue> = {};
  for (const [key, child] of Object.entries(value)) {
    if (blocked.has(normalizeKey(key))) {
      onOmit?.();
      continue;
    }
    output[key] = filterKeys(child, blocked, onOmit);
  }
  return output;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[_-]/g, '');
}
