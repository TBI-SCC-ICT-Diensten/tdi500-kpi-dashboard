import { describe, it, expect } from 'vitest';
import {
  calculateCopKpi,
  calculateConnectivityKpi,
  calculateStoringenKpi,
  calculateInregelsnelheidKpi,
  aggregateKpisForContingent,
} from '../services/kpiAggregator';
import type { HeatPumpSystem } from '../types/heatpump';
import type { ScoringThresholds } from '../services/scoringConfig';

const defaultThresholds: ScoringThresholds = {
  minCop: 3.0,
  maxSupplyTemperatureCelsius: 55,
  maxWaterPressureBar: 2.5,
  maxHighSeverityErrors: 0,
};

const makeHeatPump = (overrides: Partial<HeatPumpSystem> = {}): HeatPumpSystem => ({
  id: 'test-hp',
  uri: 'https://example.com/hp/test',
  status: 'active',
  measurements: [],
  errorCodes: [],
  ...overrides,
});

describe('calculateCopKpi', () => {
  it('returns good status when COP exceeds threshold', () => {
    const hp = makeHeatPump({
      measurements: [{ property: 'cop', value: 3.8, unit: '', rawUnit: '' }],
    });
    const kpi = calculateCopKpi([hp], defaultThresholds);
    expect(kpi.status).toBe('good');
    expect(kpi.category).toBe('efficiency');
  });

  it('returns critical status when COP is far below threshold', () => {
    const hp = makeHeatPump({
      measurements: [{ property: 'cop', value: 1.0, unit: '', rawUnit: '' }],
    });
    const kpi = calculateCopKpi([hp], defaultThresholds);
    expect(kpi.status).toBe('critical');
  });

  it('returns warning status when no COP data is present', () => {
    const kpi = calculateCopKpi([makeHeatPump()], defaultThresholds);
    expect(kpi.status).toBe('warning');
    expect(kpi.value).toBe(0);
  });
});

describe('calculateConnectivityKpi', () => {
  it('returns 100% and good when all pumps are online', () => {
    const kpi = calculateConnectivityKpi([
      makeHeatPump({ status: 'active' }),
      makeHeatPump({ status: 'active' }),
    ]);
    expect(kpi.value).toBe(100);
    expect(kpi.status).toBe('good');
    expect(kpi.category).toBe('reliability');
  });

  it('returns critical when more than 20% of pumps are offline', () => {
    const kpi = calculateConnectivityKpi([
      makeHeatPump({ status: 'active' }),
      makeHeatPump({ status: 'offline' }),
      makeHeatPump({ status: 'offline' }),
    ]);
    expect(kpi.status).toBe('critical');
  });

  it('returns warning when no heat pumps provided', () => {
    const kpi = calculateConnectivityKpi([]);
    expect(kpi.status).toBe('warning');
  });
});

describe('calculateStoringenKpi', () => {
  it('returns good when no high-severity errors', () => {
    const kpi = calculateStoringenKpi([makeHeatPump()]);
    expect(kpi.value).toBe(0);
    expect(kpi.status).toBe('good');
    expect(kpi.category).toBe('commissioning');
  });

  it('returns warning with 1 high-severity error', () => {
    const hp = makeHeatPump({
      errorCodes: [{ code: 'E01', message: 'Fault', severity: 'high' }],
    });
    const kpi = calculateStoringenKpi([hp]);
    expect(kpi.value).toBe(1);
    expect(kpi.status).toBe('warning');
  });

  it('returns critical with 3 high-severity errors', () => {
    const hp = makeHeatPump({
      errorCodes: [
        { code: 'E01', message: 'Fault 1', severity: 'high' },
        { code: 'E02', message: 'Fault 2', severity: 'high' },
        { code: 'E03', message: 'Fault 3', severity: 'critical' },
      ],
    });
    const kpi = calculateStoringenKpi([hp]);
    expect(kpi.value).toBe(3);
    expect(kpi.status).toBe('critical');
  });
});

describe('calculateInregelsnelheidKpi', () => {
  it('returns category commissioning', () => {
    const kpi = calculateInregelsnelheidKpi();
    expect(kpi.category).toBe('commissioning');
  });

  it('returns unit min', () => {
    const kpi = calculateInregelsnelheidKpi();
    expect(kpi.unit).toBe('min');
  });
});

describe('aggregateKpisForContingent', () => {
  it('returns exactly 4 KPIs', () => {
    const kpis = aggregateKpisForContingent([makeHeatPump()], defaultThresholds);
    expect(kpis).toHaveLength(4);
  });

  it('includes all required categories', () => {
    const kpis = aggregateKpisForContingent([makeHeatPump()], defaultThresholds);
    const categories = kpis.map((k) => k.category);
    expect(categories).toContain('efficiency');
    expect(categories).toContain('reliability');
    expect(categories).toContain('commissioning');
  });
});
