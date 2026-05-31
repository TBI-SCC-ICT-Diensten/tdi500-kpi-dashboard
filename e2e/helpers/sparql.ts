// Minimal SPARQL-response builders for e2e route interception.
// Shapes mirror what src/services/dataMapper.ts consumes:
//   - list:   bindings of { heatpump (uri), id (literal) }
//   - detail: bindings grouped by `heatpump` uri; error codes are carried
//             per-row via errorCodeValue / errorCodeMessage / errorCodeSeverity.
// Kept e2e-local (not imported from src/test) so the E2E layer is self-contained.

type SparqlBinding = Record<string, { type: string; value: string; datatype?: string | null }>;

interface SparqlResponse {
  head: { vars: string[] };
  results: { bindings: SparqlBinding[] };
}

export function listResponse(pumps: Array<{ uri: string; id: string }>): SparqlResponse {
  return {
    head: { vars: ['heatpump', 'id'] },
    results: {
      bindings: pumps.map((p) => ({
        heatpump: { type: 'uri', value: p.uri, datatype: null },
        id: { type: 'literal', value: p.id, datatype: 'http://www.w3.org/2001/XMLSchema#string' },
      })),
    },
  };
}

/**
 * Builds a detail response for one pump, optionally carrying a COP value.
 * A COP measurement row matches what dataMapper reads: the `cop` marker var
 * (truthy) + a numeric `value` + a `unit` (om-2/one, COP is unitless).
 * With no cop, returns a single heatpump-only row so the pump still renders.
 */
export function detailResponse(opts: { uri: string; cop?: number }): SparqlResponse {
  const bindings: SparqlBinding[] = [];
  if (opts.cop !== undefined) {
    bindings.push({
      heatpump: { type: 'uri', value: opts.uri, datatype: null },
      cop: { type: 'uri', value: 'https://marker/cop' },
      value: { type: 'literal', value: String(opts.cop) },
      unit: { type: 'uri', value: 'http://www.ontology-of-units-of-measure.org/resource/om-2/one' },
    });
  } else {
    bindings.push({ heatpump: { type: 'uri', value: opts.uri, datatype: null } });
  }
  return { head: { vars: ['heatpump', 'cop', 'value', 'unit'] }, results: { bindings } };
}

export interface ErrorCodeInput {
  code: string;
  message: string;
  severity: string;
}

/**
 * Builds a detail response for one pump carrying the given error codes.
 * One binding row per error code (extractErrorCodes reads them per row).
 */
export function detailResponseWithErrors(uri: string, errors: ErrorCodeInput[]): SparqlResponse {
  return {
    head: { vars: ['heatpump', 'errorCodeValue', 'errorCodeMessage', 'errorCodeSeverity'] },
    results: {
      bindings: errors.map((e) => ({
        heatpump: { type: 'uri', value: uri, datatype: null },
        errorCodeValue: { type: 'literal', value: e.code },
        errorCodeMessage: { type: 'literal', value: e.message },
        errorCodeSeverity: { type: 'literal', value: e.severity },
      })),
    },
  };
}
