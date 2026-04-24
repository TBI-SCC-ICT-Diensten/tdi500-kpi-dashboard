/**
 * Regression test for VV-16 variable shadowing.
 *
 * SPARQL_HEATPUMP_DETAILS reuses ?value and ?unit across OPTIONAL blocks.
 * dataMapper disambiguates by inspecting which ontology-specific marker
 * variable (?currentTemperature, ?outside, ?temperatureSetpoint,
 * ?flowPressure, ?cop, ?energyUse) is bound in each result row.
 *
 * This test protects that workaround — if someone refactors
 * dataMapper.ts or sparqlQueries.ts and breaks the disambiguation,
 * this test fails.
 */

import { describe, it, expect } from 'vitest';
import { mapSparqlToHeatPumps } from '../services/dataMapper';
import {
  makeCompleteSparqlResponse,
  makeSparqlRow,
} from '../test/fixtures';
import type { SparqlResponse } from '../types/api';

const PUMP_URI = 'https://www.tno.nl/building/data/tdi500/heatPump-test-01';

describe('dataMapper — variable shadowing (VV-16)', () => {
  it('correctly disambiguates six measurements sharing ?value/?unit', () => {
    const response = makeCompleteSparqlResponse(PUMP_URI);
    const pumps = mapSparqlToHeatPumps(response);

    expect(pumps).toHaveLength(1);
    const pump = pumps[0]!;
    expect(pump.measurements).toHaveLength(6);

    const measurementsByProperty = Object.fromEntries(
      pump.measurements.map((m) => [m.property, m.value])
    );

    expect(measurementsByProperty['roomTemperature']).toBe(21.0);
    expect(measurementsByProperty['temperatureSetpoint']).toBe(21.5);
    expect(measurementsByProperty['outsideTemperature']).toBe(7.2);
    expect(measurementsByProperty['waterPressure']).toBe(1.8);
    expect(measurementsByProperty['cop']).toBe(3.1);
    expect(measurementsByProperty['energyUsage']).toBe(15.4);
  });

  it('does not confuse setpoint with roomTemperature when values are equal', () => {
    // Classic shadowing bug: when setpoint = roomTemperature,
    // shared ?value binding can drop one row silently.
    const response: SparqlResponse = {
      head: { vars: ['heatpump', 'value', 'unit', 'currentTemperature', 'temperatureSetpoint'] },
      results: {
        bindings: [
          makeSparqlRow({ heatpump: PUMP_URI, measurementType: 'currentTemperature',  value: 21.0 }),
          makeSparqlRow({ heatpump: PUMP_URI, measurementType: 'temperatureSetpoint', value: 21.0 }),
        ],
      },
    };

    const pumps = mapSparqlToHeatPumps(response);
    const pump = pumps[0]!;
    expect(pump.measurements).toHaveLength(2);

    const props = pump.measurements.map((m) => m.property);
    expect(props).toContain('roomTemperature');
    expect(props).toContain('temperatureSetpoint');
  });

  it('maps outside+currentTemperature markers to outsideTemperature, not roomTemperature', () => {
    // The marker combination `outside` + `currentTemperature` is how
    // dataMapper distinguishes the outside reading from the indoor reading.
    const response: SparqlResponse = {
      head: { vars: ['heatpump', 'value', 'unit', 'currentTemperature', 'outside'] },
      results: {
        bindings: [
          makeSparqlRow({ heatpump: PUMP_URI, measurementType: 'outside', value: 4.5 }),
        ],
      },
    };

    const pumps = mapSparqlToHeatPumps(response);
    const pump = pumps[0]!;
    expect(pump.measurements).toHaveLength(1);
    expect(pump.measurements[0]!.property).toBe('outsideTemperature');
    expect(pump.measurements[0]!.value).toBe(4.5);
  });

  it('handles single-measurement response without dropping bindings', () => {
    const response: SparqlResponse = {
      head: { vars: ['heatpump', 'value', 'unit', 'currentTemperature'] },
      results: {
        bindings: [
          makeSparqlRow({ heatpump: PUMP_URI, measurementType: 'currentTemperature', value: 20.0 }),
        ],
      },
    };

    const pumps = mapSparqlToHeatPumps(response);
    const pump = pumps[0]!;
    expect(pump.measurements).toHaveLength(1);
    expect(pump.measurements[0]!.property).toBe('roomTemperature');
  });
});
