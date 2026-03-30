import { describe, it, expect } from 'vitest';
import {
  KRUIS_PROFIEL_MAP,
  getKruisProfiel,
  ALL_KRUIS_PROFIELEN,
} from '../config/kruisProfielen';

describe('KRUIS_PROFIEL_MAP', () => {
  it('contains exactly 9 entries', () => {
    expect(Object.keys(KRUIS_PROFIEL_MAP)).toHaveLength(9);
  });

  it('contains all valid codes', () => {
    const codes = Object.keys(KRUIS_PROFIEL_MAP);
    expect(codes).toEqual(
      expect.arrayContaining(['A1','A2','A3','B1','B2','B3','C1','C2','C3'])
    );
  });

  it('A1 has maxSupplyTemperatureCelsius 30', () => {
    expect(KRUIS_PROFIEL_MAP['A1'].maxSupplyTemperatureCelsius).toBe(30);
  });

  it('A2 has maxSupplyTemperatureCelsius 55', () => {
    expect(KRUIS_PROFIEL_MAP['A2'].maxSupplyTemperatureCelsius).toBe(55);
  });

  it('A3 has maxSupplyTemperatureCelsius 80', () => {
    expect(KRUIS_PROFIEL_MAP['A3'].maxSupplyTemperatureCelsius).toBe(80);
  });

  it('C3 has insulationLevel C', () => {
    expect(KRUIS_PROFIEL_MAP['C3'].insulationLevel).toBe('C');
  });

  it('B2 has supplyTemperatureClass 2', () => {
    expect(KRUIS_PROFIEL_MAP['B2'].supplyTemperatureClass).toBe('2');
  });

  it('every entry has a non-empty description', () => {
    for (const profiel of Object.values(KRUIS_PROFIEL_MAP)) {
      expect(profiel.description.length).toBeGreaterThan(0);
    }
  });
});

describe('getKruisProfiel', () => {
  it('returns the correct profiel for B2', () => {
    const profiel = getKruisProfiel('B2');
    expect(profiel.code).toBe('B2');
    expect(profiel.insulationLevel).toBe('B');
    expect(profiel.supplyTemperatureClass).toBe('2');
  });
});

describe('ALL_KRUIS_PROFIELEN', () => {
  it('has length 9', () => {
    expect(ALL_KRUIS_PROFIELEN).toHaveLength(9);
  });
});
