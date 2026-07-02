import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/hupie';

/**
 * Server-side write-guard tests for the /api/hupie proxy (RSEC-1).
 *
 * The INVARIANT: the proxy is INCAPABLE of forwarding an arbitrary SPARQL UPDATE.
 * Only the two structured commands (setpoint, heating-curve), after server-side
 * command/id/range validation, may reach the upstream /update/ endpoint.
 *
 * `fetch` (the upstream call) is stubbed so we can assert exactly whether — and
 * with what URL/body — a request would be forwarded. Live Hupie is never hit.
 */

const mockFetch = vi.fn();

interface MockRes {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  status(code: number): MockRes;
  json(obj: unknown): MockRes;
  send(text: unknown): MockRes;
  setHeader(k: string, v: string): void;
}

// Minimal Vercel req/res doubles (double-cast through unknown — no `any`).
function makeReq(contentType: string | undefined, body: string, method = 'POST'): VercelRequest {
  const req = {
    headers: contentType === undefined ? {} : { 'content-type': contentType },
    body, // a string → the handler's readRawBody returns it directly
    method,
  };
  return req as unknown as VercelRequest;
}

function makeRes(): MockRes {
  const res: MockRes = {
    statusCode: 0,
    body: undefined,
    headers: {},
    status(code: number) { res.statusCode = code; return res; },
    json(obj: unknown) { res.body = obj; return res; },
    send(text: unknown) { res.body = text; return res; },
    setHeader(k: string, v: string) { res.headers[k] = v; },
  };
  return res;
}

// Invoke the handler with a MockRes, casting to VercelResponse at the boundary.
const invoke = (req: VercelRequest, res: MockRes): Promise<void> =>
  handler(req, res as unknown as VercelResponse);

// The [url, options] of the single upstream fetch call (elements cast like the
// other write tests — casting from the untyped mock is not flagged).
function lastFetch(): { url: string; body: string; headers: Record<string, string> } {
  const call = mockFetch.mock.calls[0];
  return {
    url: call?.[0] as string,
    body: (call?.[1] as { body: string }).body,
    headers: (call?.[1] as { headers: Record<string, string> }).headers,
  };
}

const okUpstream = () => ({
  status: 200,
  text: async () => '',
  headers: { get: () => null },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue(okUpstream());
  process.env['HUPIE_API_KEY'] = 'test-token';
  process.env['HUPIE_API_URL'] = 'https://hupie.example/sparql/query/';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api/hupie — REJECTS and never forwards a disallowed write', () => {
  it('rejects a raw application/sparql-update body (the closed hole)', async () => {
    const res = makeRes();
    await invoke(makeReq('application/sparql-update', 'INSERT DATA { <a> <b> <c> }'), res);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects a DROP smuggled through the id field (bad charset)', async () => {
    const res = makeRes();
    await invoke(
      makeReq('application/json', JSON.stringify({ command: 'setpoint', id: 'x"}; DROP ALL; #', value: 20 })),
      res
    );
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects a DELETE/injection smuggled through the value field (not a number)', async () => {
    const res = makeRes();
    await invoke(
      makeReq('application/json', JSON.stringify({ command: 'setpoint', id: 'abc123', value: '20 } ; DELETE WHERE { ?s ?p ?o }' })),
      res
    );
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects an unknown command', async () => {
    const res = makeRes();
    await invoke(
      makeReq('application/json', JSON.stringify({ command: 'DROP', id: 'abc123' })),
      res
    );
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON', async () => {
    const res = makeRes();
    await invoke(makeReq('application/json', '{ not valid json'), res);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects extra/multi fields on a setpoint command', async () => {
    const res = makeRes();
    await invoke(
      makeReq('application/json', JSON.stringify({ command: 'setpoint', id: 'abc123', value: 20, extra: '; DROP ALL' })),
      res
    );
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects an empty / whitespace id', async () => {
    const res = makeRes();
    await invoke(
      makeReq('application/json', JSON.stringify({ command: 'setpoint', id: 'a b', value: 20 })),
      res
    );
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects an out-of-range setpoint (below and above)', async () => {
    for (const value of [5, 40]) {
      const res = makeRes();
      await invoke(
        makeReq('application/json', JSON.stringify({ command: 'setpoint', id: 'abc123', value })),
        res
      );
      expect(res.statusCode).toBe(400);
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects an out-of-range curve base and slope', async () => {
    const cases = [
      { base: 10, slope: -0.6 }, // base below 20
      { base: 70, slope: -0.6 }, // base above 60
      { base: 40, slope: -5 },   // slope below -4.0
      { base: 40, slope: -0.05 }, // slope above -0.1
    ];
    for (const c of cases) {
      const res = makeRes();
      await invoke(
        makeReq('application/json', JSON.stringify({ command: 'heating-curve', id: 'abc123', ...c })),
        res
      );
      expect(res.statusCode).toBe(400);
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('api/hupie — FORWARDS a valid write to /update/', () => {
  it('forwards a valid setpoint as a built UPDATE', async () => {
    const res = makeRes();
    await invoke(
      makeReq('application/json', JSON.stringify({ command: 'setpoint', id: 'abc123', value: 20.5 })),
      res
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const { url, body, headers } = lastFetch();
    expect(url).toContain('/update/');
    expect(url).toContain('token=test-token');
    expect(headers['Content-Type']).toBe('application/sparql-update');
    expect(body).toContain('saref:hasCommandKind hco:ControlTemperatureSetpoint');
    expect(body).toContain('saref:hasPropertyKind hco:TemperatureSetpoint');
    expect(body).toMatch(/"20\.5"\^\^xsd:double/);
    expect(body).toContain('VALUES ?id { "abc123" }');
    expect(res.statusCode).toBe(200);
  });

  it('forwards a valid heating-curve as a built UPDATE', async () => {
    const res = makeRes();
    await invoke(
      makeReq('application/json', JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 40, slope: -0.6 })),
      res
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const { url, body } = lastFetch();
    expect(url).toContain('/update/');
    expect(body).toContain('saref:hasCommandKind hco:ControlHeatingCurve');
    expect(body).toContain('saref:isValueOfProperty hco:HeatingCurveBase');
    expect(body).toMatch(/"40"\^\^xsd:double/);
    expect(body).toContain('saref:isValueOfProperty hco:HeatingCurveSlope');
    expect(body).toMatch(/"-0\.6"\^\^xsd:double/);
  });

  it('accepts the range boundaries (10/30 setpoint) and forwards each', async () => {
    for (const value of [10, 30]) {
      const res = makeRes();
      await invoke(
        makeReq('application/json', JSON.stringify({ command: 'setpoint', id: 'abc123', value })),
        res
      );
      expect(res.statusCode).toBe(200);
    }
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('api/hupie — READ path is untouched', () => {
  it('forwards a SELECT (application/sparql-query) verbatim to /query/, never /update/', async () => {
    const res = makeRes();
    const query = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
    await invoke(makeReq('application/sparql-query', query), res);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const { url, body, headers } = lastFetch();
    expect(url).not.toContain('/update/');
    expect(url).toContain('/query/');
    expect(body).toBe(query); // forwarded verbatim
    expect(headers['Content-Type']).toBe('application/sparql-query');
    expect(res.statusCode).toBe(200);
  });

  it('treats a missing Content-Type as a read (default sparql-query), never /update/', async () => {
    const res = makeRes();
    await invoke(makeReq(undefined, 'SELECT * WHERE { ?s ?p ?o }'), res);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(lastFetch().url).not.toContain('/update/');
  });
});
