import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import {
  mapBouwjaarToInsulation,
  mapEnergielabelToInsulation,
  deriveKruisProfielCode,
  mapAfgifteToClass,
  fetchBagApiData,
} from '../services/bagService';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn((err: unknown): boolean =>
      typeof err === 'object' && err !== null && 'isAxiosError' in err
    ),
  },
}));

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

describe('fetchBagApiData', () => {
  const mockBagApiResponse = {
    data: {
      _embedded: {
        adressen: [{
          openbareRuimteNaam: 'Teststraat',
          huisnummer: 1,
          postcode: '1234AB',
          woonplaatsNaam: 'Teststad',
          oorspronkelijkBouwjaar: ['1975'],
          oppervlakte: 120,
          gebruiksdoelen: ['woonfunctie'],
          pandIdentificaties: ['1234100000000001'],
        }],
      },
    },
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns bouwjaar, oppervlakte and gebruiksdoelen on success', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce(mockBagApiResponse);
    const result = await fetchBagApiData('1234AB', '1');
    expect(result).not.toBeNull();
    expect(result?.bouwjaar).toBe(1975);
    expect(result?.oppervlakte).toBe(120);
    expect(result?.gebruiksdoelen).toEqual(['woonfunctie']);
  });

  it('returns null when _embedded is missing', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: {} });
    const result = await fetchBagApiData('1234AB', '1');
    expect(result).toBeNull();
  });

  it('returns null when _embedded.adressen is empty', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { _embedded: { adressen: [] } },
    });
    const result = await fetchBagApiData('1234AB', '1');
    expect(result).toBeNull();
  });

  it('calls the /api/bag proxy (key is now attached server-side)', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce(mockBagApiResponse);
    await fetchBagApiData('1234AB', '1');
    expect(vi.mocked(axios.get)).toHaveBeenCalledWith(
      expect.stringContaining('/api/bag'),
    );
  });

  it('handles non-array oorspronkelijkBouwjaar gracefully', async () => {
    const response = {
      data: {
        _embedded: {
          adressen: [{
            ...mockBagApiResponse.data._embedded.adressen[0],
            oorspronkelijkBouwjaar: null,
          }],
        },
      },
    };
    vi.mocked(axios.get).mockResolvedValueOnce(response);
    const result = await fetchBagApiData('1234AB', '1');
    expect(result?.bouwjaar).toBeNull();
    expect(result?.oppervlakte).toBe(120);
  });

  it('strips spaces from postcode before calling API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce(mockBagApiResponse);
    await fetchBagApiData('1234 AB', '1');
    expect(vi.mocked(axios.get)).toHaveBeenCalledWith(
      expect.stringContaining('postcode=1234AB'),
    );
  });

  it('uses exacteMatch=true in the request URL', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce(mockBagApiResponse);
    await fetchBagApiData('1234AB', '1');
    expect(vi.mocked(axios.get)).toHaveBeenCalledWith(
      expect.stringContaining('exacteMatch=true'),
    );
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
