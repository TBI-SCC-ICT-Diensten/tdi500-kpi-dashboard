import { describe, it, expect } from 'vitest';
import { deriveInsulation, type BagResult } from '../services/bagService';

/**
 * CHARACTERIZATION for the insulation-precedence lifted out of BagLookupPage's
 * in-render IIFE into bagService.deriveInsulation (PR-10). Pins the priority
 * order energielabel > BAG bouwjaar > manual bouwjaar > null.
 */
const bag = (over: Partial<BagResult>): BagResult => ({
  weergavenaam: '',
  straatnaam: '',
  huisnummer: '',
  postcode: '',
  woonplaatsnaam: '',
  bouwjaar: null,
  gebruiksdoel: null,
  gebruiksdoelen: [],
  oppervlakte: null,
  pandStatus: null,
  energielabel: null,
  energielabelGeldigTot: null,
  ...over,
});

describe('deriveInsulation — precedence', () => {
  it('energielabel wins over bouwjaar (label B → A even with bouwjaar 1921 → C)', () => {
    const r = deriveInsulation(bag({ energielabel: 'B', bouwjaar: 1921 }), '');
    expect(r?.level).toBe('A');
    expect(r?.confidence).toBe('hoog');
    expect(r?.reason).toContain('Energielabel B');
  });

  it('falls back to BAG bouwjaar when no energielabel', () => {
    const r = deriveInsulation(bag({ bouwjaar: 1921 }), '');
    expect(r?.level).toBe('C');
    expect(r?.reason).toContain('1921');
  });

  it('falls back to manual bouwjaar when no energielabel and no BAG bouwjaar', () => {
    const r = deriveInsulation(bag({}), '2020');
    expect(r?.level).toBe('A');
  });

  it('returns null when nothing is available', () => {
    expect(deriveInsulation(bag({}), '')).toBeNull();
    expect(deriveInsulation(null, '')).toBeNull();
  });

  it('ignores a non-numeric manual bouwjaar', () => {
    expect(deriveInsulation(bag({}), 'abc')).toBeNull();
  });
});
