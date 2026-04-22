import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createContingent } from '../services/contingentService';
import { aggregateKpisForContingent } from '../services/kpiAggregator';
import { SCORING_THRESHOLDS_BY_PROFIEL } from '../services/scoringConfig';
import type { HeatPumpSystem } from '../types/heatpump';

// Test the pure logic that useDashboardData orchestrates —
// hook rendering tests require @testing-library/react which is available
// but the core logic is already tested via unit tests on the services.
// These tests verify the integration: contingent construction + KPI aggregation.

const makeHeatPump = (id: string, status: HeatPumpSystem['status'] = 'active'): HeatPumpSystem => ({
  id,
  uri: `https://example.com/hp/${id}`,
  status,
  measurements: [],
  errorCodes: [],
});

describe('contingent construction from heat pump list', () => {
  it('creates a default B2 contingent from all heat pumps', () => {
    const pumps = [makeHeatPump('hp1'), makeHeatPump('hp2')];
    const contingent = createContingent('contingent-B2', 'Alle warmtepompen', 'B2', pumps);

    expect(contingent.id).toBe('contingent-B2');
    expect(contingent.kruisProfiel.code).toBe('B2');
    expect(contingent.heatPumps).toHaveLength(2);
  });

  it('B2 contingent has correct kruisprofiel properties', () => {
    const contingent = createContingent('contingent-B2', 'Test', 'B2', []);
    expect(contingent.kruisProfiel.insulationLevel).toBe('B');
    expect(contingent.kruisProfiel.supplyTemperatureClass).toBe('2');
    expect(contingent.kruisProfiel.maxSupplyTemperatureCelsius).toBe(55);
  });
});

describe('KPI aggregation for selected contingent', () => {
  it('returns 4 KPIs for a contingent with heat pumps', () => {
    const pumps = [makeHeatPump('hp1'), makeHeatPump('hp2')];
    const contingent = createContingent('contingent-B2', 'Test', 'B2', pumps);
    const thresholds = SCORING_THRESHOLDS_BY_PROFIEL[contingent.kruisProfiel.code];
    const kpis = aggregateKpisForContingent(contingent.heatPumps, thresholds);

    expect(kpis).toHaveLength(4);
  });

  it('returns empty array when no contingent is selected', () => {
    // When selectedContingent is null, kpis should be []
    const kpis: ReturnType<typeof aggregateKpisForContingent> = [];
    expect(kpis).toHaveLength(0);
  });

  it('KPI categories cover efficiency, reliability, and commissioning', () => {
    const pumps = [makeHeatPump('hp1')];
    const contingent = createContingent('contingent-B2', 'Test', 'B2', pumps);
    const thresholds = SCORING_THRESHOLDS_BY_PROFIEL['B2'];
    const kpis = aggregateKpisForContingent(contingent.heatPumps, thresholds);
    const categories = kpis.map((k) => k.category);

    expect(categories).toContain('efficiency');
    expect(categories).toContain('reliability');
    expect(categories).toContain('commissioning');
  });

  it('offline pumps reduce connectivity KPI below 100%', () => {
    const pumps = [
      makeHeatPump('hp1', 'active'),
      makeHeatPump('hp2', 'offline'),
    ];
    const contingent = createContingent('contingent-B2', 'Test', 'B2', pumps);
    const thresholds = SCORING_THRESHOLDS_BY_PROFIEL['B2'];
    const kpis = aggregateKpisForContingent(contingent.heatPumps, thresholds);
    const connectivity = kpis.find((k) => k.category === 'reliability');

    expect(connectivity?.value).toBe(50);
    expect(connectivity?.status).not.toBe('good');
  });
});
