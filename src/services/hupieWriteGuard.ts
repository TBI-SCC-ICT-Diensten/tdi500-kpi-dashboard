// ⚠ BUNDLED SERVER-SIDE (RSEC-1): this is the single source of truth for the Hupie
// write allow-list. It is imported by BOTH the Vercel proxy (api/hupie.ts) and the
// Azure Functions v4 handler (azure-api/src/functions/hupie.ts), and each serverless
// runtime bundles it. Keep this module DEPENDENCY-FREE — it imports only the two pure
// modules below (sparqlQueries, commandRanges) and nothing browser-only (import.meta.env,
// MUI, DOM), or the function build breaks.
//
// The guarantee: the proxy is structurally INCAPABLE of forwarding an arbitrary SPARQL
// UPDATE. Only the two known, range-checked commands (setpoint, heating-curve) — built
// from fixed templates after validation — can ever reach /update/.

import {
  SPARQL_SET_TEMPERATURE_SETPOINT,
  SPARQL_SET_HEATING_CURVE,
} from './sparqlQueries';
import { COMMAND_RANGES } from '../config/commandRanges';

/**
 * Allowed heat-pump id charset. Real Hupie ids are short alphanumeric strings
 * (e.g. "bdgp0cbmq2t7uke"); mock ids use hyphens ("mock-pump-01"). Restricting to
 * [A-Za-z0-9_-] means the id cannot break out of the `VALUES ?id { "<id>" }`
 * string binding or inject SPARQL (RSEC-5). Conservative by design — widen only if
 * a real id genuinely needs more characters.
 */
export const ALLOWED_ID = /^[A-Za-z0-9_-]{1,64}$/;

export type ValidatedWrite = { ok: true; query: string } | { ok: false; reason: string };

/**
 * Parses + validates a structured write command and returns the UPDATE query to
 * forward, or a rejection reason. Nothing else can produce a query — so no caller
 * input ever reaches /update/ except via the two fixed templates.
 */
export function buildValidatedUpdate(raw: string): ValidatedWrite {
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
