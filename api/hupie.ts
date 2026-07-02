import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  SPARQL_SET_TEMPERATURE_SETPOINT,
  SPARQL_SET_HEATING_CURVE,
} from '../src/services/sparqlQueries';
import { COMMAND_RANGES } from '../src/config/commandRanges';

/**
 * Server-side proxy for the Hupie SPARQL endpoint (VV-26 + RSEC-1).
 *
 * READ path (unchanged): a Content-Type of application/sparql-query (the default)
 * forwards the body verbatim to the Hupie /query/ endpoint with ?token= attached
 * server-side, exactly as before.
 *
 * WRITE path (RSEC-1 hardening): writes are NOT accepted as a raw SPARQL string.
 * A raw application/sparql-update body is REJECTED (4xx). Instead the client sends
 * a structured JSON command ({command, id, value | base, slope}); the server
 * validates command + id charset + numeric ranges, then BUILDS the UPDATE from one
 * of the two fixed templates (SPARQL_SET_TEMPERATURE_SETPOINT / SPARQL_SET_HEATING_CURVE)
 * and forwards that to /update/. This makes the proxy structurally INCAPABLE of
 * forwarding an arbitrary SPARQL UPDATE (DROP/CLEAR/DELETE/multi-op/etc.) — the only
 * writes that can reach Hupie are the two known, range-checked commands.
 *
 * Reject reasons are logged server-side only; upstream internals are never echoed
 * to the client (RSEC-7). The client keeps its own #138 mock-guard + range
 * validation; this server guard is additive, authoritative defense-in-depth.
 */

// Disable Vercel's body parser so the raw body is read as-is (the read path
// forwards a non-JSON SPARQL body byte-faithfully; the write path JSON-parses it).
export const config = { api: { bodyParser: false } };

/**
 * Allowed heat-pump id charset. Real Hupie ids are short alphanumeric strings
 * (e.g. "bdgp0cbmq2t7uke"); mock ids use hyphens ("mock-pump-01"). Restricting to
 * [A-Za-z0-9_-] means the id cannot break out of the `VALUES ?id { "<id>" }`
 * string binding or inject SPARQL (RSEC-5). Conservative by design — widen only if
 * a real id genuinely needs more characters.
 */
const ALLOWED_ID = /^[A-Za-z0-9_-]{1,64}$/;

async function readRawBody(req: VercelRequest): Promise<string> {
  // If the platform already parsed a text/raw body, reuse it; otherwise
  // (bodyParser disabled) read the request stream directly.
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks).toString('utf8');
}

type ValidatedWrite = { ok: true; query: string } | { ok: false; reason: string };

/**
 * Parses + validates a structured write command and returns the UPDATE query to
 * forward, or a rejection reason. Nothing else can produce a query — so no caller
 * input ever reaches /update/ except via the two fixed templates.
 */
function buildValidatedUpdate(raw: string): ValidatedWrite {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'malformed JSON body' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, reason: 'body must be a JSON object' };
  }

  const body = parsed as Record<string, unknown>;
  const command = body['command'];
  const id = body['id'];
  const keys = Object.keys(body).sort().join(',');

  if (typeof id !== 'string' || !ALLOWED_ID.test(id)) {
    return { ok: false, reason: 'invalid or missing id' };
  }

  if (command === 'setpoint') {
    // Exact field set — reject anything extra (no smuggling of other fields).
    if (keys !== 'command,id,value') {
      return { ok: false, reason: 'unexpected fields for setpoint command' };
    }
    const value = body['value'];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { ok: false, reason: 'value must be a finite number' };
    }
    if (value < COMMAND_RANGES.setpoint.min || value > COMMAND_RANGES.setpoint.max) {
      return { ok: false, reason: 'setpoint value out of range' };
    }
    return { ok: true, query: SPARQL_SET_TEMPERATURE_SETPOINT(id, value) };
  }

  if (command === 'heating-curve') {
    if (keys !== 'base,command,id,slope') {
      return { ok: false, reason: 'unexpected fields for heating-curve command' };
    }
    const base = body['base'];
    const slope = body['slope'];
    if (typeof base !== 'number' || !Number.isFinite(base)) {
      return { ok: false, reason: 'base must be a finite number' };
    }
    if (typeof slope !== 'number' || !Number.isFinite(slope)) {
      return { ok: false, reason: 'slope must be a finite number' };
    }
    if (base < COMMAND_RANGES.curveBase.min || base > COMMAND_RANGES.curveBase.max) {
      return { ok: false, reason: 'curve base out of range' };
    }
    if (slope < COMMAND_RANGES.curveSlope.min || slope > COMMAND_RANGES.curveSlope.max) {
      return { ok: false, reason: 'curve slope out of range' };
    }
    return { ok: true, query: SPARQL_SET_HEATING_CURVE(id, base, slope) };
  }

  return { ok: false, reason: 'unknown command' };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const apiKey = process.env['HUPIE_API_KEY'];
  const baseUrl = process.env['HUPIE_API_URL'];

  if (!apiKey || !baseUrl) {
    console.error('[hupie proxy] HUPIE_API_KEY or HUPIE_API_URL not configured');
    res.status(500).json({ error: 'Hupie proxy not configured on server' });
    return;
  }

  const contentType = req.headers['content-type'] ?? 'application/sparql-query';

  // ── WRITE path — structured command only (RSEC-1) ─────────────────────────
  if (contentType.includes('application/json')) {
    const raw = await readRawBody(req);
    const result = buildValidatedUpdate(raw);

    if (!result.ok) {
      // Server-side only — never echo the reason to the client.
      console.warn(`[hupie proxy] write rejected: ${result.reason}`);
      res.status(400).json({ error: 'Invalid or disallowed write command' });
      return;
    }

    const updateBase = baseUrl
      .replace(/\/query\/?$/, '/update/')
      .replace(/\/sparql\/?$/, '/update/');
    const separator = updateBase.includes('?') ? '&' : '?';
    const updateUrl = `${updateBase}${separator}token=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-update',
          'Accept': 'application/json',
        },
        body: result.query,
      });

      const text = await response.text();
      const upstreamContentType = response.headers.get('content-type');
      if (upstreamContentType) res.setHeader('Content-Type', upstreamContentType);

      res.status(response.status).send(text);
    } catch (err) {
      // RSEC-7: do NOT echo upstream internals to the client.
      console.error(
        '[hupie proxy] upstream write failed:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      res.status(502).json({ error: 'Upstream Hupie request failed' });
    }
    return;
  }

  // ── Raw SPARQL UPDATE — rejected. This is the line that closes the hole. ───
  if (contentType.includes('application/sparql-update')) {
    console.warn(
      '[hupie proxy] raw SPARQL UPDATE rejected — writes must use the structured JSON command contract'
    );
    res.status(400).json({
      error: 'Raw SPARQL UPDATE is not accepted; use the structured command contract',
    });
    return;
  }

  // ── READ path — UNCHANGED from the original proxy ──────────────────────────
  // application/sparql-query (or the default) → forward verbatim to /query/.
  const separator = baseUrl.includes('?') ? '&' : '?';
  const upstreamUrl = `${baseUrl}${separator}token=${encodeURIComponent(apiKey)}`;

  try {
    const body = await readRawBody(req);
    const response = await fetch(upstreamUrl, {
      method: req.method ?? 'POST',
      headers: {
        'Content-Type': contentType,
        'Accept': 'application/json',
      },
      body,
    });

    const text = await response.text();
    const upstreamContentType = response.headers.get('content-type');
    if (upstreamContentType) res.setHeader('Content-Type', upstreamContentType);

    res.status(response.status).send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[hupie proxy] upstream request failed:', message);
    res.status(502).json({ error: 'Upstream Hupie request failed', detail: message });
  }
}
