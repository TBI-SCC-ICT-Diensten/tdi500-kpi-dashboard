import { describe, it, expect } from 'vitest';
import type { SparqlResponse, SparqlBinding } from '../types/api';
import {
  mapSparqlToHeatPumps,
  groupBindingsByHeatPump,
  extractMeasurements,
  extractErrorCodes,
  extractHeatingCurve,
  determineStatus,
} from '../services/dataMapper';

const makeSparqlValue = (value: string, type: 'uri' | 'literal' = 'literal') => ({ type, value });

const createMockBinding = (heatpumpUri: string, overrides: Record<string, { type: 'uri' | 'literal'; value: string }> = {}): SparqlBinding => ({
  heatpump: makeSparqlValue(heatpumpUri, 'uri'),
  ...overrides,
});

const createMockResponse = (bindings: SparqlBinding[]): SparqlResponse => ({
  head: {
    vars: ['heatpump', 'building', 'room', 'value', 'unit', 'currentTemperature', 'temperatureSetpoint', 'errorCodeValue', 'errorCodeMessage', 'errorCodeSeverity'],
  },
  results: { bindings },
});

describe('mapSparqlToHeatPumps', () => {
  it('returns array of HeatPumpSystem objects for valid response with 2 heat pumps', () => {
    const bindings: SparqlBinding[] = [
      createMockBinding('https://www.tno.nl/building/data/tdi500/heatPump-hp1', {
        building: makeSparqlValue('https://example.org/building1', 'uri'),
        room: makeSparqlValue('https://example.org/room1', 'uri'),
        value: makeSparqlValue('21.5'),
        unit: makeSparqlValue('http://www.ontology-of-units-of-measure.org/resource/om-2/degreeCelsius', 'uri'),
        currentTemperature: makeSparqlValue('https://example.org/prop1', 'uri'),
      }),
      createMockBinding('https://www.tno.nl/building/data/tdi500/heatPump-hp2', {
        building: makeSparqlValue('https://example.org/building2', 'uri'),
        value: makeSparqlValue('2.1'),
        unit: makeSparqlValue('http://www.ontology-of-units-of-measure.org/resource/om-2/bar', 'uri'),
        flowPressure: makeSparqlValue('https://example.org/pressure', 'uri'),
      }),
    ];

    const result = mapSparqlToHeatPumps(createMockResponse(bindings));

    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe('hp1');
    expect(result[0]!.uri).toBe('https://www.tno.nl/building/data/tdi500/heatPump-hp1');
    expect(result[0]!.building).toBe('https://example.org/building1');
    expect(result[0]!.status).toBe('active');
    expect(result[1]!.id).toBe('hp2');
  });

  it('returns empty array for empty bindings', () => {
    const result = mapSparqlToHeatPumps(createMockResponse([]));
    expect(result).toEqual([]);
  });

  it('handles missing optional fields gracefully', () => {
    const bindings: SparqlBinding[] = [
      createMockBinding('https://www.tno.nl/building/data/tdi500/heatPump-hp3'),
    ];

    const result = mapSparqlToHeatPumps(createMockResponse(bindings));

    expect(result).toHaveLength(1);
    expect(result[0]!.building).toBeUndefined();
    expect(result[0]!.room).toBeUndefined();
    expect(result[0]!.measurements).toEqual([]);
    expect(result[0]!.errorCodes).toEqual([]);
    expect(result[0]!.heatingCurve).toBeUndefined();
    expect(result[0]!.status).toBe('active');
  });
});

describe('groupBindingsByHeatPump', () => {
  it('groups bindings by heat pump URI', () => {
    const bindings: SparqlBinding[] = [
      createMockBinding('https://example.org/hp1', { value: makeSparqlValue('21') }),
      createMockBinding('https://example.org/hp1', { value: makeSparqlValue('22') }),
      createMockBinding('https://example.org/hp2', { value: makeSparqlValue('19') }),
    ];

    const grouped = groupBindingsByHeatPump(bindings);

    expect(grouped.size).toBe(2);
    expect(grouped.get('https://example.org/hp1')).toHaveLength(2);
    expect(grouped.get('https://example.org/hp2')).toHaveLength(1);
  });

  it('skips bindings without heatpump field', () => {
    const bindings: SparqlBinding[] = [
      { value: makeSparqlValue('21') },
    ];

    const grouped = groupBindingsByHeatPump(bindings);
    expect(grouped.size).toBe(0);
  });
});

describe('extractMeasurements', () => {
  it('returns correct Measurement with resolved unit', () => {
    const bindings: SparqlBinding[] = [
      {
        heatpump: makeSparqlValue('https://example.org/hp1', 'uri'),
        value: makeSparqlValue('21.5'),
        unit: makeSparqlValue('http://www.ontology-of-units-of-measure.org/resource/om-2/degreeCelsius', 'uri'),
        currentTemperature: makeSparqlValue('https://example.org/temp', 'uri'),
      },
    ];

    const measurements = extractMeasurements(bindings);

    expect(measurements).toHaveLength(1);
    expect(measurements[0]!.property).toBe('roomTemperature');
    expect(measurements[0]!.value).toBe(21.5);
    expect(measurements[0]!.unit).toBe('°C');
  });

  it('returns measurement with fallback unit for missing unit', () => {
    const bindings: SparqlBinding[] = [
      {
        heatpump: makeSparqlValue('https://example.org/hp1', 'uri'),
        value: makeSparqlValue('3.5'),
        cop: makeSparqlValue('https://example.org/cop', 'uri'),
      },
    ];

    const measurements = extractMeasurements(bindings);

    expect(measurements).toHaveLength(1);
    expect(measurements[0]!.property).toBe('cop');
    expect(measurements[0]!.unit).toBe('unknown unit');
  });

  it('returns empty array when no value fields present', () => {
    const bindings: SparqlBinding[] = [
      { heatpump: makeSparqlValue('https://example.org/hp1', 'uri') },
    ];

    expect(extractMeasurements(bindings)).toEqual([]);
  });
});

describe('extractErrorCodes', () => {
  it('returns correct ErrorCode array', () => {
    const bindings: SparqlBinding[] = [
      {
        heatpump: makeSparqlValue('https://example.org/hp1', 'uri'),
        errorCodeValue: makeSparqlValue('E001'),
        errorCodeMessage: makeSparqlValue('Low pressure'),
        errorCodeSeverity: makeSparqlValue('warning'),
      },
      {
        heatpump: makeSparqlValue('https://example.org/hp1', 'uri'),
        errorCodeValue: makeSparqlValue('E002'),
        errorCodeMessage: makeSparqlValue('Sensor failure'),
        errorCodeSeverity: makeSparqlValue('critical'),
      },
    ];

    const errors = extractErrorCodes(bindings);

    expect(errors).toHaveLength(2);
    expect(errors[0]!.code).toBe('E001');
    expect(errors[0]!.message).toBe('Low pressure');
    expect(errors[0]!.severity).toBe('warning');
    expect(errors[1]!.code).toBe('E002');
  });

  it('returns empty array when no error codes present', () => {
    const bindings: SparqlBinding[] = [
      { heatpump: makeSparqlValue('https://example.org/hp1', 'uri') },
    ];

    expect(extractErrorCodes(bindings)).toEqual([]);
  });

  it('deduplicates error codes', () => {
    const bindings: SparqlBinding[] = [
      {
        errorCodeValue: makeSparqlValue('E001'),
        errorCodeMessage: makeSparqlValue('Low pressure'),
        errorCodeSeverity: makeSparqlValue('warning'),
      },
      {
        errorCodeValue: makeSparqlValue('E001'),
        errorCodeMessage: makeSparqlValue('Low pressure'),
        errorCodeSeverity: makeSparqlValue('warning'),
      },
    ];

    expect(extractErrorCodes(bindings)).toHaveLength(1);
  });
});

describe('extractHeatingCurve', () => {
  it('returns HeatingCurve when data is present', () => {
    const bindings: SparqlBinding[] = [
      {
        baseValue: makeSparqlValue('35'),
        baseUnit: makeSparqlValue('http://www.ontology-of-units-of-measure.org/resource/om-2/degreeCelsius', 'uri'),
        slopeValue: makeSparqlValue('1.2'),
        slopeUnit: makeSparqlValue('http://www.ontology-of-units-of-measure.org/resource/om-2/one', 'uri'),
      },
    ];

    const curve = extractHeatingCurve(bindings);

    expect(curve).toBeDefined();
    expect(curve!.baseValue).toBe(35);
    expect(curve!.baseUnit).toBe('°C');
    expect(curve!.slopeValue).toBe(1.2);
    expect(curve!.slopeUnit).toBe('');
  });

  it('returns undefined when no heating curve data', () => {
    const bindings: SparqlBinding[] = [
      { heatpump: makeSparqlValue('https://example.org/hp1', 'uri') },
    ];

    expect(extractHeatingCurve(bindings)).toBeUndefined();
  });
});

describe('determineStatus', () => {
  it('returns "error" when critical error codes exist', () => {
    const errors = [{ code: 'E001', message: 'Failure', severity: 'critical' }];
    expect(determineStatus(errors, '', '')).toBe('error');
  });

  it('returns "error" when error-severity codes exist', () => {
    const errors = [{ code: 'E002', message: 'Sensor fail', severity: 'error' }];
    expect(determineStatus(errors, 'connected', 'connected')).toBe('error');
  });

  it('returns "offline" when internet is disconnected', () => {
    expect(determineStatus([], 'disconnected', 'connected')).toBe('offline');
  });

  it('returns "offline" when server is disconnected', () => {
    expect(determineStatus([], 'connected', 'disconnected')).toBe('offline');
  });

  it('returns "warning" when warning codes exist', () => {
    const errors = [{ code: 'W001', message: 'Low pressure', severity: 'warning' }];
    expect(determineStatus(errors, 'connected', 'connected')).toBe('warning');
  });

  it('returns "active" when no errors and connected', () => {
    expect(determineStatus([], 'connected', 'connected')).toBe('active');
  });

  it('returns "active" when no errors and no connection info', () => {
    expect(determineStatus([], '', '')).toBe('active');
  });
});
