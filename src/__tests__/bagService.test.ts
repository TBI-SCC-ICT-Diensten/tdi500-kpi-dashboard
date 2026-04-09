import { describe, it, expect } from 'vitest';
import {
  mapBouwjaarToInsulation,
  mapEnergielabelToInsulation,
  deriveKruisProfielCode,
  mapAfgifteToClass,
} from '../services/bagService';

describe('mapBouwjaarToInsulation', () => {
  it('maps pre-1945 to insulation C with high confidence', () => {
    const result = mapBouwjaarToInsulation(1921);
    expect(result.level).toBe('C');
    expect(result.confidence).toBe('hoog');
  });

  it('maps 1945-1974 to insulation C with medium confidence', () => {
    const result = mapBouwjaarToInsulation(1960);
    expect(result.level).toBe('C');
    expect(result.confidence).toBe('middel');
  });

  it('maps 1975-1991 to insulation B', () => {
    const result = mapBouwjaarToInsulation(1982);
    expect(result.level).toBe('B');
  });

  it('maps 1992-2011 to insulation B with low confidence', () => {
    const result = mapBouwjaarToInsulation(2000);
    expect(result.level).toBe('B');
    expect(result.confidence).toBe('laag');
  });

  it('maps post-2012 to insulation A with high confidence', () => {
    const result = mapBouwjaarToInsulation(2020);
    expect(result.level).toBe('A');
    expect(result.confidence).toBe('hoog');
  });

  it('includes bouwjaar in reason text', () => {
    const result = mapBouwjaarToInsulation(1921);
    expect(result.reason).toContain('1921');
  });
});

describe('mapAfgifteToClass', () => {
  it('maps vloerverwarming to class 1', () => {
    expect(mapAfgifteToClass('vloerverwarming')).toBe('1');
  });
  it('maps radiator to class 2', () => {
    expect(mapAfgifteToClass('radiator')).toBe('2');
  });
  it('maps hete lucht to class 3', () => {
    expect(mapAfgifteToClass('hete lucht')).toBe('3');
  });
});

describe('deriveKruisProfielCode', () => {
  it('derives C2 for pre-1945 woning with radiator (jaren 30 woning)', () => {
    const insulation = mapBouwjaarToInsulation(1921);
    const code = deriveKruisProfielCode(insulation.level, 'radiator');
    expect(code).toBe('C2');
  });

  it('derives A1 for modern woning with vloerverwarming', () => {
    const insulation = mapBouwjaarToInsulation(2018);
    const code = deriveKruisProfielCode(insulation.level, 'vloerverwarming');
    expect(code).toBe('A1');
  });

  it('derives B3 for mid-century woning with hete lucht', () => {
    const insulation = mapBouwjaarToInsulation(1980);
    const code = deriveKruisProfielCode(insulation.level, 'hete lucht');
    expect(code).toBe('B3');
  });

  it('all 9 kruisprofielen are reachable via derivation', () => {
    const cases: Array<[number, 'vloerverwarming' | 'radiator' | 'hete lucht', string]> = [
      [2020, 'vloerverwarming', 'A1'],
      [2020, 'radiator',        'A2'],
      [2020, 'hete lucht',      'A3'],
      [1980, 'vloerverwarming', 'B1'],
      [1980, 'radiator',        'B2'],
      [1980, 'hete lucht',      'B3'],
      [1921, 'vloerverwarming', 'C1'],
      [1921, 'radiator',        'C2'],
      [1921, 'hete lucht',      'C3'],
    ];
    for (const [year, systeem, expected] of cases) {
      const ins = mapBouwjaarToInsulation(year);
      expect(deriveKruisProfielCode(ins.level, systeem)).toBe(expected);
    }
  });
});

describe('mapEnergielabelToInsulation', () => {
  it('maps A to insulation level A', () => {
    expect(mapEnergielabelToInsulation('A')).toBe('A');
  });

  it('maps A+ variants to insulation level A', () => {
    expect(mapEnergielabelToInsulation('A+')).toBe('A');
    expect(mapEnergielabelToInsulation('A++')).toBe('A');
    expect(mapEnergielabelToInsulation('A+++')).toBe('A');
    expect(mapEnergielabelToInsulation('A++++')).toBe('A');
  });

  it('maps B to insulation level A', () => {
    expect(mapEnergielabelToInsulation('B')).toBe('A');
  });

  it('maps C to insulation level B', () => {
    expect(mapEnergielabelToInsulation('C')).toBe('B');
  });

  it('maps D to insulation level B', () => {
    expect(mapEnergielabelToInsulation('D')).toBe('B');
  });

  it('maps E to insulation level C', () => {
    expect(mapEnergielabelToInsulation('E')).toBe('C');
  });

  it('maps F to insulation level C', () => {
    expect(mapEnergielabelToInsulation('F')).toBe('C');
  });

  it('maps G to insulation level C', () => {
    expect(mapEnergielabelToInsulation('G')).toBe('C');
  });

  it('is case-insensitive', () => {
    expect(mapEnergielabelToInsulation('a')).toBe('A');
    expect(mapEnergielabelToInsulation('g')).toBe('C');
  });
});
