import { describe, it, expect } from 'vitest';
import {
  TNO_CATALOGUS,
  getCatalogusProfiel,
  getRecommendedSettings,
  getAvailableFabrikanten,
} from '../config/tnoCatalogus';
import { ALL_FABRIKANTEN } from '../types/heatpump';
import type { KruisProfielCode } from '../types/heatpump';

const ALL_PROFIELEN: KruisProfielCode[] = [
  'A1', 'A2', 'A3',
  'B1', 'B2', 'B3',
  'C1', 'C2', 'C3',
];

describe('TNO_CATALOGUS — structure', () => {
  it('contains all 9 kruisprofielen', () => {
    ALL_PROFIELEN.forEach((code) => {
      expect(TNO_CATALOGUS[code]).toBeDefined();
    });
  });

  it('each profiel has all 4 fabrikanten', () => {
    ALL_PROFIELEN.forEach((code) => {
      const profiel = TNO_CATALOGUS[code];
      ALL_FABRIKANTEN.forEach((fabrikant) => {
        expect(profiel[fabrikant]).toBeDefined();
      });
    });
  });

  it('every fabrikant entry has all 11 parameters', () => {
    const expectedKeys = [
      'warmtepompType',
      'afgiftesysteem',
      'maxAanvoertemperatuur',
      'minimaleCop',
      'stooklijn',
      'ruimteInvloed',
      'vrijgaveBijverwarming',
      'wachttijdBackupMin',
      'hybrideModus',
      'deltaT',
      'bivalentTemperatuur',
    ];

    ALL_PROFIELEN.forEach((code) => {
      ALL_FABRIKANTEN.forEach((fabrikant) => {
        const settings = TNO_CATALOGUS[code][fabrikant];
        expectedKeys.forEach((key) => {
          expect(settings).toHaveProperty(key);
        });
      });
    });
  });
});

describe('TNO_CATALOGUS — known values (regression)', () => {
  // Spot-check values from the TNO document. If someone refactors the
  // data and accidentally loses values, these tests catch it.

  it('A1/Bosch matches Tabel 1 exactly', () => {
    const s = TNO_CATALOGUS.A1.Bosch;
    expect(s.warmtepompType).toBe('compress 3400i compress 7400i');
    expect(s.afgiftesysteem).toBe('vloerverw');
    expect(s.maxAanvoertemperatuur).toBe(45);
    expect(s.stooklijn).toBe('20/20, -10/30');
    expect(s.deltaT).toBe('7K');
  });

  it('B2/Remeha matches Tabel 5 exactly', () => {
    const s = TNO_CATALOGUS.B2.Remeha;
    expect(s.afgiftesysteem).toBe('radiator');
    expect(s.stooklijn).toBe('1,1');
    expect(s.wachttijdBackupMin).toBe(120);
  });

  it('C3/Alklima matches Tabel 9 exactly', () => {
    const s = TNO_CATALOGUS.C3.Alklima;
    expect(s.warmtepompType).toBe('ERPT20X-VM2E');
    expect(s.afgiftesysteem).toBe('hete lucht');
    expect(s.hybrideModus).toBe('ERPX-VM2E');
  });

  it('preserves null values from X cells (A2/Remeha)', () => {
    const s = TNO_CATALOGUS.A2.Remeha;
    expect(s.warmtepompType).toBeNull();
    expect(s.maxAanvoertemperatuur).toBeNull();
    expect(s.minimaleCop).toBeNull();
    expect(s.bivalentTemperatuur).toBeNull();
  });

  it('preserves numeric 120 vs 30 distinction in wachttijdBackupMin', () => {
    // Goed geïsoleerd + vloerverwarming → Remeha says 120 min
    expect(TNO_CATALOGUS.A1.Remeha.wachttijdBackupMin).toBe(120);
    // Slecht geïsoleerd + hete lucht → Remeha says 30 min
    expect(TNO_CATALOGUS.C3.Remeha.wachttijdBackupMin).toBe(30);
  });
});

describe('getCatalogusProfiel', () => {
  it('returns the full profiel for B2', () => {
    const profiel = getCatalogusProfiel('B2');
    expect(profiel.Intergas).toBeDefined();
    expect(profiel.Bosch).toBeDefined();
    expect(profiel.Remeha).toBeDefined();
    expect(profiel.Alklima).toBeDefined();
  });

  it('returns the same reference for the same code', () => {
    expect(getCatalogusProfiel('A1')).toBe(getCatalogusProfiel('A1'));
  });
});

describe('getRecommendedSettings', () => {
  it('returns settings for valid profiel + fabrikant', () => {
    const s = getRecommendedSettings('B2', 'Bosch');
    expect(s.afgiftesysteem).toBe('radiatoren/ vloerverw');
    expect(s.stooklijn).toBe('20/22, -10/45');
  });
});

describe('getAvailableFabrikanten', () => {
  it('returns all 4 fabrikanten when all have at least one value', () => {
    // In the current catalogus, every fabrikant has at least
    // warmtepompType OR afgiftesysteem filled in — no all-null rows
    const list = getAvailableFabrikanten('B2');
    expect(list).toHaveLength(4);
    expect(list).toContain('Intergas');
    expect(list).toContain('Bosch');
    expect(list).toContain('Remeha');
    expect(list).toContain('Alklima');
  });
});
