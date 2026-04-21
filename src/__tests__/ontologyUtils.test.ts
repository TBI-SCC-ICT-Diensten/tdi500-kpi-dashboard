import { describe, it, expect } from 'vitest';
import {
  resolveUnit,
  resolveProperty,
  parseNumericValue,
  parseTimestamp,
  extractIdFromUri,
  resolveConnectionState,
  extractStringValue,
} from '../utils/ontologyUtils';

describe('resolveUnit', () => {
  it('returns °C for degreeCelsius URI', () => {
    expect(resolveUnit('http://www.ontology-of-units-of-measure.org/resource/om-2/degreeCelsius')).toBe('°C');
  });

  it('returns bar for bar URI', () => {
    expect(resolveUnit('http://www.ontology-of-units-of-measure.org/resource/om-2/bar')).toBe('bar');
  });

  it('returns "unknown unit" for unknown URI', () => {
    expect(resolveUnit('http://example.org/unknown')).toBe('unknown unit');
  });

  it('returns "unknown unit" for empty string', () => {
    expect(resolveUnit('')).toBe('unknown unit');
  });
});

describe('resolveProperty', () => {
  it('returns roomTemperature for CurrentTemperature URI', () => {
    expect(resolveProperty('https://www.tno.nl/building/ontology/heatpump-common-ontology#CurrentTemperature')).toBe('roomTemperature');
  });

  it('returns "unknown" for unrecognized URI', () => {
    expect(resolveProperty('http://example.org/unknown')).toBe('unknown');
  });
});

describe('parseNumericValue', () => {
  it('parses a valid number string', () => {
    expect(parseNumericValue({ type: 'literal', value: '21.5' })).toBe(21.5);
  });

  it('returns 0 for undefined', () => {
    expect(parseNumericValue(undefined)).toBe(0);
  });

  it('returns 0 for non-numeric string', () => {
    expect(parseNumericValue({ type: 'literal', value: 'abc' })).toBe(0);
  });

  it('returns 0 for empty value', () => {
    expect(parseNumericValue({ type: 'literal', value: '' })).toBe(0);
  });
});

describe('parseTimestamp', () => {
  it('parses a valid ISO date string', () => {
    const result = parseTimestamp({ type: 'literal', value: '2025-01-15T10:30:00Z' });
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toBe('2025-01-15T10:30:00.000Z');
  });

  it('returns undefined for invalid string', () => {
    expect(parseTimestamp({ type: 'literal', value: 'not-a-date' })).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(parseTimestamp(undefined)).toBeUndefined();
  });
});

describe('extractIdFromUri', () => {
  it('extracts last segment after hyphen', () => {
    expect(extractIdFromUri('https://www.tno.nl/building/data/tdi500/heatPump-abc123')).toBe('abc123');
  });

  it('extracts last segment after slash', () => {
    expect(extractIdFromUri('https://example.org/resource/myId')).toBe('myId');
  });

  it('returns original string if no separators', () => {
    expect(extractIdFromUri('singlevalue')).toBe('singlevalue');
  });
});

describe('resolveConnectionState', () => {
  it('returns "connected" for "connected"', () => {
    expect(resolveConnectionState('connected')).toBe('connected');
  });

  it('returns "connected" for "Online"', () => {
    expect(resolveConnectionState('Online')).toBe('connected');
  });

  it('returns "connected" for "true"', () => {
    expect(resolveConnectionState('true')).toBe('connected');
  });

  it('returns "disconnected" for "disconnected"', () => {
    expect(resolveConnectionState('disconnected')).toBe('disconnected');
  });

  it('returns "disconnected" for "false"', () => {
    expect(resolveConnectionState('false')).toBe('disconnected');
  });

  it('returns "unknown" for undefined', () => {
    expect(resolveConnectionState(undefined)).toBe('unknown');
  });

  it('returns "unknown" for unrecognized value', () => {
    expect(resolveConnectionState('something-else')).toBe('unknown');
  });
});

describe('extractStringValue', () => {
  it('returns the value string', () => {
    expect(extractStringValue({ type: 'uri', value: 'https://example.org' })).toBe('https://example.org');
  });

  it('returns empty string for undefined', () => {
    expect(extractStringValue(undefined)).toBe('');
  });
});
