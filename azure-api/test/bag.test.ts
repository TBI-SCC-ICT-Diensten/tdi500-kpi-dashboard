import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { HttpRequest } from '@azure/functions';
import { bagHandler } from '../src/handlers/bag';

const mockFetch = vi.fn();

function makeReq(url: string, method = 'GET'): HttpRequest {
  return { method, url, headers: new Headers(), query: new URLSearchParams(new URL(url).search), text: async () => '' } as unknown as HttpRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue({ status: 200, text: async () => '{}', headers: { get: () => 'application/hal+json' } });
  process.env.BAG_API_KEY = 'bag-test-key';
});

afterEach(() => vi.unstubAllGlobals());

describe('bagHandler', () => {
  it('forwards the query string to the Kadaster adressenuitgebreid endpoint with the right headers', async () => {
    const res = await bagHandler(makeReq('https://swa/api/bag?postcode=3012KN&huisnummer=180&exacteMatch=true'));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(url).toBe('https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/adressenuitgebreid?postcode=3012KN&huisnummer=180&exacteMatch=true');
    expect(opts.headers['X-Api-Key']).toBe('bag-test-key');
    expect(opts.headers['Accept']).toBe('application/hal+json');
    expect(opts.headers['Accept-Crs']).toBe('epsg:28992');
    expect(res.status).toBe(200);
  });

  it('returns 500 when BAG_API_KEY is not configured', async () => {
    delete process.env.BAG_API_KEY;
    const res = await bagHandler(makeReq('https://swa/api/bag?postcode=3012KN&huisnummer=180'));
    expect(res.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
