import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { HttpRequest } from '@azure/functions';
import { epOnlineHandler } from '../src/handlers/ep-online';

const mockFetch = vi.fn();

function makeReq(url: string, method = 'GET'): HttpRequest {
  return { method, url, headers: new Headers(), query: new URLSearchParams(new URL(url).search), text: async () => '' } as unknown as HttpRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue({ status: 200, text: async () => '[]', headers: { get: () => 'application/json' } });
  process.env.EP_ONLINE_API_KEY = 'ep-test-key';
});

afterEach(() => vi.unstubAllGlobals());

describe('epOnlineHandler', () => {
  it('forwards to public.ep-online.nl/<subpath> with the remaining query + Authorization/User-Agent', async () => {
    const res = await epOnlineHandler(
      makeReq('https://swa/api/ep-online?subpath=api/v5/PandEnergielabel/Adres&postcode=3012KN&huisnummer=180')
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(url).toBe('https://public.ep-online.nl/api/v5/PandEnergielabel/Adres?postcode=3012KN&huisnummer=180');
    expect(opts.headers['Authorization']).toBe('ep-test-key');
    expect(opts.headers['User-Agent']).toBe('TDI500-Dashboard/1.0');
    expect(res.status).toBe(200);
  });

  it('returns 400 when subpath is missing (not forwarded)', async () => {
    const res = await epOnlineHandler(makeReq('https://swa/api/ep-online?postcode=3012KN'));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns 500 when EP_ONLINE_API_KEY is not set', async () => {
    delete process.env.EP_ONLINE_API_KEY;
    const res = await epOnlineHandler(makeReq('https://swa/api/ep-online?subpath=api/v5/x'));
    expect(res.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
