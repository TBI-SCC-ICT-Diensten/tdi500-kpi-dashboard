/**
 * Shared test fixtures — one source of truth for test data.
 *
 * Before: every test file had its own makeHeatPump / makeKpis helper.
 * This module centralizes them. Shapes match the real types in
 * src/types/heatpump.ts and src/types/api.ts exactly.
 */

import type {
  HeatPumpSystem,
  KeyPerformanceIndicator,
  KpiStatus,
} from '../types/heatpump';
import type { SparqlBinding, SparqlResponse } from '../types/api';

/** Unit URIs the dataMapper's resolveUnit() understands. */
const UNIT_URI = {
  degreeCelsius: 'http://www.ontology-of-units-of-measure.org/resource/om-2/degreeCelsius',
  bar:           'http://www.ontology-of-units-of-measure.org/resource/om-2/bar',
  kilowattHour:  'http://www.ontology-of-units-of-measure.org/resource/om-2/kilowattHour',
  kilowatt:      'http://www.ontology-of-units-of-measure.org/resource/om-2/kilowatt',
  one:           'http://www.ontology-of-units-of-measure.org/resource/om-2/one',
};

/**
 * Builds a HeatPumpSystem with sensible defaults.
 * Pass overrides to customize for specific tests.
 */
export function makeHeatPump(
  overrides: Partial<HeatPumpSystem> = {}
): HeatPumpSystem {
  return {
    id: 'test-pump-01',
    uri: 'https://www.tno.nl/building/data/tdi500/heatPump-test-pump-01',
    building: 'Test building',
    room: 'Test room',
    status: 'active',
    measurements: [
      { property: 'roomTemperature',     value: 21.0, unit: '°C',   rawUnit: 'degreeCelsius' },
      { property: 'temperatureSetpoint', value: 21.0, unit: '°C',   rawUnit: 'degreeCelsius' },
      { property: 'outsideTemperature',  value: 7.5,  unit: '°C',   rawUnit: 'degreeCelsius' },
      { property: 'waterPressure',       value: 1.8,  unit: 'bar',  rawUnit: 'bar' },
      { property: 'cop',                 value: 3.2,  unit: '',     rawUnit: '' },
    ],
    errorCodes: [],
    internetConnection: 'connected',
    serverConnection:   'connected',
    heatingCurve: {
      baseValue:  40,
      baseUnit:   '°C',
      slopeValue: -0.6,
      slopeUnit:  '°C/°C',
    },
    ...overrides,
  };
}

/**
 * Builds the standard 4-KPI array that aggregateKpisForContingent produces.
 * Overrides allow per-test customization without copying the full array.
 */
export function makeKpis(overrides: {
  copValue?:        number;
  copStatus?:       KpiStatus;
  connectValue?:    number;
  connectStatus?:   KpiStatus;
  storingenValue?:  number;
  storingenStatus?: KpiStatus;
  inregelStatus?:   KpiStatus;
} = {}): KeyPerformanceIndicator[] {
  return [
    {
      id: 'cop',
      name: 'Gemiddelde COP',
      value: overrides.copValue ?? 3.8,
      unit: '',
      category: 'efficiency',
      status: overrides.copStatus ?? 'good',
      description: 'Test COP',
    },
    {
      id: 'connectivity',
      name: 'Connectiviteit',
      value: overrides.connectValue ?? 100,
      unit: '%',
      category: 'reliability',
      status: overrides.connectStatus ?? 'good',
      description: 'Test connectivity',
    },
    {
      id: 'storingen',
      name: 'Storingen',
      value: overrides.storingenValue ?? 0,
      unit: 'meldingen',
      category: 'commissioning',
      status: overrides.storingenStatus ?? 'good',
      description: 'Test storingen',
    },
    {
      id: 'inregelsnelheid',
      name: 'Inregelsnelheid',
      value: 0,
      unit: 'min',
      category: 'commissioning',
      status: overrides.inregelStatus ?? 'good',
      description: 'Placeholder',
    },
  ];
}

/**
 * Marker names used in SPARQL binding rows by dataMapper to disambiguate
 * which measurement a shared-?value row represents.
 *
 * 'outside' requires BOTH 'currentTemperature' AND 'outside' markers
 * per dataMapper.determineMeasurementProperty().
 */
export type SparqlMeasurementMarker =
  | 'currentTemperature'   // → roomTemperature
  | 'outside'              // → outsideTemperature (also adds currentTemperature marker)
  | 'temperatureSetpoint'
  | 'flowPressure'         // → waterPressure
  | 'cop'
  | 'energyUse';           // → energyUsage

/**
 * Builds a SPARQL binding row for a single heat pump detail
 * using the VARIABLE SHADOWING pattern (?value / ?unit shared across
 * OPTIONAL blocks) as the real Hupie API returns.
 *
 * Each call produces one binding row representing ONE measurement.
 * dataMapper inspects which marker is bound to decide the MeasurementProperty.
 */
export function makeSparqlRow(params: {
  heatpump: string;
  measurementType: SparqlMeasurementMarker;
  value: number;
  unitUri?: string;
}): SparqlBinding {
  const { heatpump, measurementType, value, unitUri = UNIT_URI.degreeCelsius } = params;

  const binding: SparqlBinding = {
    heatpump: { type: 'uri',     value: heatpump },
    value:    { type: 'literal', value: String(value) },
    unit:     { type: 'uri',     value: unitUri },
  };

  // Ontology-specific marker — what dataMapper inspects for disambiguation.
  binding[measurementType] = { type: 'uri', value: `https://marker/${measurementType}` };

  // Outside-temperature rows need BOTH 'currentTemperature' AND 'outside' markers
  // (dataMapper checks: currentTemperature present → if outside also → outsideTemperature)
  if (measurementType === 'outside') {
    binding['currentTemperature'] = { type: 'uri', value: 'https://marker/currentTemperature' };
  }

  return binding;
}

/**
 * Builds a complete SPARQL response (multi-row) for one heat pump
 * with six standard measurements. Useful for integration tests.
 *
 * Returned rows produce these MeasurementProperty values (after mapping):
 *   roomTemperature, temperatureSetpoint, outsideTemperature,
 *   waterPressure, cop, energyUsage
 */
export function makeCompleteSparqlResponse(heatpumpUri: string): SparqlResponse {
  const rows: SparqlBinding[] = [
    makeSparqlRow({ heatpump: heatpumpUri, measurementType: 'currentTemperature',  value: 21.0 }),
    makeSparqlRow({ heatpump: heatpumpUri, measurementType: 'temperatureSetpoint', value: 21.5 }),
    makeSparqlRow({ heatpump: heatpumpUri, measurementType: 'outside',             value: 7.2  }),
    makeSparqlRow({ heatpump: heatpumpUri, measurementType: 'flowPressure',        value: 1.8, unitUri: UNIT_URI.bar }),
    makeSparqlRow({ heatpump: heatpumpUri, measurementType: 'cop',                 value: 3.1, unitUri: UNIT_URI.one }),
    makeSparqlRow({ heatpump: heatpumpUri, measurementType: 'energyUse',           value: 15.4, unitUri: UNIT_URI.kilowattHour }),
  ];

  return {
    head: { vars: ['heatpump', 'value', 'unit', 'currentTemperature',
                   'outside', 'temperatureSetpoint', 'flowPressure',
                   'cop', 'energyUse'] },
    results: { bindings: rows },
  };
}
