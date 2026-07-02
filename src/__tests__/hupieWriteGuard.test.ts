import { describe, it, expect } from 'vitest';
import { buildValidatedUpdate } from '../services/hupieWriteGuard';

/**
 * The RSEC-1 invariant, proven ONCE at the pure-guard level — transport-agnostic, so it
 * holds for BOTH the Vercel proxy (api/hupie.ts) and the Azure Functions v4 handler
 * (azure-api), which both import this module. buildValidatedUpdate is the ONLY thing that
 * can produce a query to forward to /update/: anything not matching the two commands
 * (with a valid id + in-range values) returns { ok: false } and never yields a query.
 */

describe('buildValidatedUpdate — REJECTS everything that is not one of the two commands', () => {
  it('rejects malformed JSON', () => {
    expect(buildValidatedUpdate('{ not json').ok).toBe(false);
  });

  it('rejects a non-object body', () => {
    expect(buildValidatedUpdate('42').ok).toBe(false);
    expect(buildValidatedUpdate('null').ok).toBe(false);
    expect(buildValidatedUpdate('"a string"').ok).toBe(false);
  });

  it('rejects an unknown command', () => {
    expect(buildValidatedUpdate(JSON.stringify({ command: 'DROP', id: 'abc123' })).ok).toBe(false);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'delete', id: 'abc123' })).ok).toBe(false);
  });

  it('rejects a DROP/DELETE/injection smuggled through the id (charset guard, RSEC-5)', () => {
    for (const id of ['x"}; DROP ALL; #', 'a b', '', 'a/b', 'a\nb', 'a"b', 'x'.repeat(65)]) {
      expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id, value: 20 })).ok).toBe(false);
    }
  });

  it('rejects a non-number / injection value', () => {
    expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: '20 } ; DELETE WHERE { ?s ?p ?o }' })).ok).toBe(false);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: NaN })).ok).toBe(false);
  });

  it('rejects extra / smuggled fields', () => {
    expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: 20, extra: '; DROP ALL' })).ok).toBe(false);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 40, slope: -0.6, x: 1 })).ok).toBe(false);
  });

  it('rejects out-of-range setpoint (below and above)', () => {
    expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: 5 })).ok).toBe(false);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: 40 })).ok).toBe(false);
  });

  it('rejects out-of-range curve base and slope', () => {
    expect(buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 10, slope: -0.6 })).ok).toBe(false);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 70, slope: -0.6 })).ok).toBe(false);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 40, slope: -5 })).ok).toBe(false);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 40, slope: -0.05 })).ok).toBe(false);
  });
});

describe('buildValidatedUpdate — BUILDS the correct UPDATE for the two valid commands', () => {
  it('builds the setpoint UPDATE (predicates/units/id/value)', () => {
    const r = buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: 20.5 }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.query).toContain('saref:hasCommandKind hco:ControlTemperatureSetpoint');
      expect(r.query).toContain('saref:hasPropertyKind hco:TemperatureSetpoint');
      expect(r.query).toContain('om:degreeCelsius');
      expect(r.query).toMatch(/"20\.5"\^\^xsd:double/);
      expect(r.query).toContain('VALUES ?id { "abc123" }');
    }
  });

  it('builds the heating-curve UPDATE (base + slope + units)', () => {
    const r = buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 40, slope: -0.6 }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.query).toContain('saref:hasCommandKind hco:ControlHeatingCurve');
      expect(r.query).toContain('saref:isValueOfProperty hco:HeatingCurveBase');
      expect(r.query).toMatch(/"40"\^\^xsd:double/);
      expect(r.query).toContain('saref:isValueOfProperty hco:HeatingCurveSlope');
      expect(r.query).toMatch(/"-0\.6"\^\^xsd:double/);
      expect(r.query).toContain('hco:DegreeCelsiusPerDegreeCelsius');
    }
  });

  it('accepts the range boundaries', () => {
    expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: 10 })).ok).toBe(true);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'setpoint', id: 'abc123', value: 30 })).ok).toBe(true);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 20, slope: -4.0 })).ok).toBe(true);
    expect(buildValidatedUpdate(JSON.stringify({ command: 'heating-curve', id: 'abc123', base: 60, slope: -0.1 })).ok).toBe(true);
  });
});
