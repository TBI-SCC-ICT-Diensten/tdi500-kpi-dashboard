import { describe, it, expect } from 'vitest';
import { createContingent, groupHeatPumpsByKruisProfiel } from '../services/contingentService';
import type { HeatPumpSystem, KruisProfielCode } from '../types/heatpump';

const makeHeatPump = (id: string): HeatPumpSystem => ({
  id,
  uri: `https://example.com/hp/${id}`,
  status: 'active',
  measurements: [],
  errorCodes: [],
});

describe('createContingent', () => {
  it('creates a contingent with the correct kruisprofiel', () => {
    const contingent = createContingent('c1', 'Test A1', 'A1', [makeHeatPump('hp1')]);
    expect(contingent.kruisProfiel.code).toBe('A1');
    expect(contingent.kruisProfiel.insulationLevel).toBe('A');
    expect(contingent.kruisProfiel.maxSupplyTemperatureCelsius).toBe(30);
    expect(contingent.heatPumps).toHaveLength(1);
  });
});

describe('groupHeatPumpsByKruisProfiel', () => {
  it('groups heat pumps by kruisProfielCode', () => {
    const pumps = [
      { ...makeHeatPump('hp1'), kruisProfielCode: 'A1' as KruisProfielCode },
      { ...makeHeatPump('hp2'), kruisProfielCode: 'A1' as KruisProfielCode },
      { ...makeHeatPump('hp3'), kruisProfielCode: 'B2' as KruisProfielCode },
    ];
    const contingents = groupHeatPumpsByKruisProfiel(pumps);
    expect(contingents).toHaveLength(2);
    const a1 = contingents.find((c) => c.kruisProfiel.code === 'A1');
    expect(a1?.heatPumps).toHaveLength(2);
  });

  it('skips pumps with no kruisProfielCode', () => {
    const pumps = [
      { ...makeHeatPump('hp1') },
    ];
    const contingents = groupHeatPumpsByKruisProfiel(pumps);
    expect(contingents).toHaveLength(0);
  });
});
