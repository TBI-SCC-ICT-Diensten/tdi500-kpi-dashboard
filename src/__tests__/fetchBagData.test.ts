import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchBagData } from '../services/bagService';

/**
 * CHARACTERIZATION tests for bagService.fetchBagData — the 3-step orchestration
 * (PDOK Locatieserver -> BAG Individuele Bevragingen -> EP-online) that was
 * previously uncovered (~36%). These assert the CURRENT behaviour exactly,
 * including quirks; they are the safety net for later refactors (PR-4/PR-10).
 *
 * axios is mocked at the module boundary — no live PDOK/BAG/EP calls. axios.get
 * is routed by URL so the three steps can be driven/failed independently.
 */

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: (err: unknown): boolean =>
      typeof err === 'object' && err !== null && 'isAxiosError' in err,
  },
}));

const pdokOk = {
  data: {
    response: {
      docs: [
        {
          huisnummer: '1',
          weergavenaam: 'Teststraat 1, 1234 AB Teststad',
          straatnaam: 'Teststraat',
          woonplaatsnaam: 'Teststad',
          postcode: '1234AB',
        },
      ],
    },
  },
};

const bagOk = {
  data: {
    _embedded: {
      adressen: [
        {
          oorspronkelijkBouwjaar: ['1980'],
          oppervlakte: 100,
          gebruiksdoelen: ['woonfunctie'],
          adresseerbaarObjectGeometrie: { punt: { coordinates: [85000, 446000] } },
        },
      ],
    },
  },
};

const epOk = { data: [{ Energieklasse: 'B', Geldig_tot: '2030-12-31' }] };

/** Default happy-path router: PDOK ok, BAG ok, EP ok. */
const routeOk = (url: string) => {
  if (url.includes('/free')) return Promise.resolve(pdokOk);
  if (url.includes('/api/bag')) return Promise.resolve(bagOk);
  if (url.includes('PandEnergielabel')) return Promise.resolve(epOk);
  return Promise.reject(new Error(`unexpected url: ${url}`));
};

const axiosError = (status?: number) => ({ isAxiosError: true, response: status ? { status } : undefined });

beforeEach(() => {
  vi.mocked(axios.get).mockReset();
});

describe('fetchBagData — success path', () => {
  it('combines PDOK + BAG + EP into a single BagResult', async () => {
    vi.mocked(axios.get).mockImplementation(routeOk as never);
    const result = await fetchBagData('1234AB', '1');

    expect(result.weergavenaam).toBe('Teststraat 1, 1234 AB Teststad');
    expect(result.straatnaam).toBe('Teststraat');
    expect(result.huisnummer).toBe('1');
    expect(result.postcode).toBe('1234AB');
    expect(result.woonplaatsnaam).toBe('Teststad');
    expect(result.bouwjaar).toBe(1980);
    expect(result.oppervlakte).toBe(100);
    expect(result.gebruiksdoel).toBe('woonfunctie');
    expect(result.gebruiksdoelen).toEqual(['woonfunctie']);
    expect(result.rdCoordinates).toEqual([85000, 446000]);
    expect(result.energielabel).toBe('B');
    expect(result.energielabelGeldigTot).toBe('2030-12-31');
    expect(result.energielabelError).toBeUndefined();
    // pandStatus is hardcoded null (not returned by adressenuitgebreid).
    expect(result.pandStatus).toBeNull();
  });

  it('picks the doc whose huisnummer exactly matches', async () => {
    const twoDocs = {
      data: {
        response: {
          docs: [
            { huisnummer: '10', weergavenaam: 'Andere 10', straatnaam: 'Andere', woonplaatsnaam: 'X' },
            { huisnummer: '1', weergavenaam: 'Teststraat 1', straatnaam: 'Teststraat', woonplaatsnaam: 'Teststad' },
          ],
        },
      },
    };
    vi.mocked(axios.get).mockImplementation(((url: string) =>
      url.includes('/free') ? Promise.resolve(twoDocs) : routeOk(url)) as never);
    const result = await fetchBagData('1234AB', '1');
    expect(result.weergavenaam).toBe('Teststraat 1');
  });
});

describe('fetchBagData — postcode validation / CQL-injection guard', () => {
  it('throws on a malformed postcode and makes NO network call', async () => {
    vi.mocked(axios.get).mockImplementation(routeOk as never);
    await expect(fetchBagData('XXXX', '1')).rejects.toThrow('Ongeldige postcode: "XXXX"');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('rejects an injection-y postcode BEFORE any network call', async () => {
    vi.mocked(axios.get).mockImplementation(routeOk as never);
    await expect(fetchBagData("1234AB' OR '1'='1", '1')).rejects.toThrow(/Ongeldige postcode/);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('accepts a spaced/lowercase postcode (whitespace stripped + upper-cased)', async () => {
    vi.mocked(axios.get).mockImplementation(routeOk as never);
    const result = await fetchBagData('1234 ab', '1');
    expect(result.postcode).toBe('1234AB');
  });

  // CHARACTERIZATION: only the postcode is regex-guarded; huisnummer is merely
  // trimmed and interpolated into the PDOK query — no validation. Documented here
  // so a future hardening PR has a baseline (not asserting it's "safe").
  it('does not validate huisnummer (only trims it)', async () => {
    vi.mocked(axios.get).mockImplementation(routeOk as never);
    await expect(fetchBagData('1234AB', "1' OR 1=1")).resolves.toBeTruthy();
  });
});

describe('fetchBagData — step 1 (PDOK) failures', () => {
  it('throws a PDOK message when the PDOK request rejects', async () => {
    vi.mocked(axios.get).mockImplementation(((url: string) =>
      url.includes('/free') ? Promise.reject(new Error('network')) : routeOk(url)) as never);
    await expect(fetchBagData('1234AB', '1')).rejects.toThrow(
      'Adres kon niet worden gevonden via PDOK Locatieserver'
    );
  });

  it('throws "Geen adres gevonden" when PDOK returns zero docs', async () => {
    vi.mocked(axios.get).mockImplementation(((url: string) =>
      url.includes('/free')
        ? Promise.resolve({ data: { response: { docs: [] } } })
        : routeOk(url)) as never);
    await expect(fetchBagData('1234AB', '1')).rejects.toThrow(
      'Geen adres gevonden voor 1234AB 1'
    );
  });
});

describe('fetchBagData — step 2 (BAG) is non-fatal', () => {
  it('continues with null bouwjaar/oppervlakte when BAG rejects', async () => {
    vi.mocked(axios.get).mockImplementation(((url: string) =>
      url.includes('/api/bag') ? Promise.reject(axiosError(500)) : routeOk(url)) as never);
    const result = await fetchBagData('1234AB', '1');
    // PDOK + EP data still present; BAG fields fall back to null/empty.
    expect(result.weergavenaam).toBe('Teststraat 1, 1234 AB Teststad');
    expect(result.bouwjaar).toBeNull();
    expect(result.oppervlakte).toBeNull();
    expect(result.gebruiksdoelen).toEqual([]);
    expect(result.energielabel).toBe('B');
  });
});

describe('fetchBagData — step 3 (EP-online) is non-fatal', () => {
  it('leaves energielabel null on a 404 (no registered label) without error', async () => {
    vi.mocked(axios.get).mockImplementation(((url: string) =>
      url.includes('PandEnergielabel') ? Promise.reject(axiosError(404)) : routeOk(url)) as never);
    const result = await fetchBagData('1234AB', '1');
    expect(result.energielabel).toBeNull();
    expect(result.energielabelError).toBeUndefined();
  });

  it('sets "Proxy niet bereikbaar" on a network error (no status)', async () => {
    vi.mocked(axios.get).mockImplementation(((url: string) =>
      url.includes('PandEnergielabel') ? Promise.reject(axiosError(undefined)) : routeOk(url)) as never);
    const result = await fetchBagData('1234AB', '1');
    expect(result.energielabel).toBeNull();
    expect(result.energielabelError).toBe('Proxy niet bereikbaar');
  });

  it('sets "EP-online fout (500)" on an upstream 500', async () => {
    vi.mocked(axios.get).mockImplementation(((url: string) =>
      url.includes('PandEnergielabel') ? Promise.reject(axiosError(500)) : routeOk(url)) as never);
    const result = await fetchBagData('1234AB', '1');
    expect(result.energielabelError).toBe('EP-online fout (500)');
  });
});
