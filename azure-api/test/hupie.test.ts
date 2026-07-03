import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { HttpRequest } from '@azure/functions';
import { hupieHandler } from '../src/handlers/hupie';

/**
 * v4 handler integration tests for the Hupie proxy. The RSEC-1 invariant is proven
 * exhaustively at the pure-guard level (src/__tests__/hupieWriteGuard.test.ts); here we
 * prove the v4 HANDLER wires it correctly: json-write forwards a built UPDATE to
 * /update/, a raw sparql-update is rejected 400 (never forwarded), a rejected command
 * is not forwarded, and a read forwards verbatim to /query/. Upstream fetch is mocked.
 */

const mockFetch = vi.fn();

function makeReq(opts: { method?: string; url?: string; contentType?: string; body?: string }): HttpRequest {
  const { method = 'POST', url = 'https://swa/api/hupie', contentType, body = '' } = opts;
  return {
    method,
    url,
    headers: new Headers(contentType ? { 'content-type': contentType } : {}),
    query: new URLSearchParams(new URL(url).search),
    text: async () => body,
  } as unknown as HttpRequest;
}

const okUpstream = () => ({ status: 200, text: async () => '', headers: { get: () => null } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue(okUpstream());
  process.env.HUPIE_API_KEY = 'test-token';
  process.env.HUPIE_API_URL = 'https://hupie.example/sparql/query/';
});

afterEach(() => vi.unstubAllGlobals());

describe('hupieHandler — write path (RSEC-1)', () => {
  it('rejects a raw application/sparql-update body (400, not forwarded)', async () => {
    const res = await hupieHandler(makeReq({ contentType: 'application/sparql-update', body: 'INSERT DATA { <a> <b> <c> }' }));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('forwards a valid setpoint as a built UPDATE to /update/', async () => {
    const res = await hupieHandler(makeReq({ contentType: 'application/json', body: JSON.stringify({ command: 'setpoint', id: 'abc123', value: 20.5 }) }));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, { body: string; headers: Record<string, string> }];
    expect(url).toContain('/update/');
    expect(url).toContain('token=test-token');
    expect(opts.headers['Content-Type']).toBe('application/sparql-update');
    expect(opts.body).toContain('saref:hasCommandKind hco:ControlTemperatureSetpoint');
    expect(opts.body).toMatch(/"20\.5"\^\^xsd:double/);
    expect(opts.body).toContain('VALUES ?id { "abc123" }');
    expect(res.status).toBe(200);
  });

  it('does not forward an out-of-range setpoint (400)', async () => {
    const res = await hupieHandler(makeReq({ contentType: 'application/json', body: JSON.stringify({ command: 'setpoint', id: 'abc123', value: 99 }) }));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not forward a DROP smuggled through the id (400)', async () => {
    const res = await hupieHandler(makeReq({ contentType: 'application/json', body: JSON.stringify({ command: 'setpoint', id: 'x"}; DROP ALL; #', value: 20 }) }));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('forwards a valid heating-curve as a built UPDATE', async () => {
    await hupieHandler(makeReq({ contentType: 'application/json', body: JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 40, slope: -0.6 }) }));
    const [url, opts] = mockFetch.mock.calls[0] as [string, { body: string }];
    expect(url).toContain('/update/');
    expect(opts.body).toContain('saref:hasCommandKind hco:ControlHeatingCurve');
    expect(opts.body).toMatch(/"-0\.6"\^\^xsd:double/);
  });
});

describe('hupieHandler — read path (unchanged)', () => {
  it('forwards a SELECT (sparql-query) verbatim to /query/, never /update/', async () => {
    const query = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
    const res = await hupieHandler(makeReq({ contentType: 'application/sparql-query', body: query }));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, { body: string; headers: Record<string, string> }];
    expect(url).not.toContain('/update/');
    expect(url).toContain('/query/');
    expect(opts.body).toBe(query);
    expect(opts.headers['Content-Type']).toBe('application/sparql-query');
    expect(res.status).toBe(200);
  });

  it('returns 500 when secrets are not configured', async () => {
    delete process.env.HUPIE_API_KEY;
    const res = await hupieHandler(makeReq({ contentType: 'application/sparql-query', body: 'SELECT * WHERE { ?s ?p ?o }' }));
    expect(res.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
