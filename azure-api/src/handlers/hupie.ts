import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import { buildValidatedUpdate } from '../../../src/services/hupieWriteGuard';

/**
 * Azure Functions v4 port of the Hupie SPARQL proxy (VV-26 + RSEC-1).
 * Behaviour is IDENTICAL to the Vercel handler (api/hupie.ts): the three-way
 * Content-Type split, the ?token= append, verbatim upstream forwarding, the RSEC-7
 * generic write errors vs the preserved detail on the read catch. The write
 * allow-list is the shared src/services/hupieWriteGuard (one source of truth), so the
 * proxy stays structurally INCAPABLE of forwarding an arbitrary SPARQL UPDATE.
 *
 * Secrets are read from process.env exactly as before — on the Function App these are
 * Key Vault references resolved by the system-assigned managed identity (no Key Vault
 * SDK in code).
 */
export async function hupieHandler(request: HttpRequest): Promise<HttpResponseInit> {
  const apiKey = process.env['HUPIE_API_KEY'];
  const baseUrl = process.env['HUPIE_API_URL'];

  if (!apiKey || !baseUrl) {
    console.error('[hupie proxy] HUPIE_API_KEY or HUPIE_API_URL not configured');
    return { status: 500, jsonBody: { error: 'Hupie proxy not configured on server' } };
  }

  const contentType = request.headers.get('content-type') ?? 'application/sparql-query';

  // ── WRITE path — structured command only (RSEC-1) ─────────────────────────
  if (contentType.includes('application/json')) {
    const raw = await request.text();
    const result = buildValidatedUpdate(raw);

    if (!result.ok) {
      // Server-side only — never echo the reason to the client.
      console.warn(`[hupie proxy] write rejected: ${result.reason}`);
      return { status: 400, jsonBody: { error: 'Invalid or disallowed write command' } };
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
      return {
        status: response.status,
        headers: upstreamContentType ? { 'Content-Type': upstreamContentType } : undefined,
        body: text,
      };
    } catch (err) {
      // RSEC-7: do NOT echo upstream internals to the client.
      console.error(
        '[hupie proxy] upstream write failed:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      return { status: 502, jsonBody: { error: 'Upstream Hupie request failed' } };
    }
  }

  // ── Raw SPARQL UPDATE — rejected. This is the line that closes the hole. ───
  if (contentType.includes('application/sparql-update')) {
    console.warn(
      '[hupie proxy] raw SPARQL UPDATE rejected — writes must use the structured JSON command contract'
    );
    return {
      status: 400,
      jsonBody: { error: 'Raw SPARQL UPDATE is not accepted; use the structured command contract' },
    };
  }

  // ── READ path — forward verbatim to /query/ (unchanged behaviour) ──────────
  const separator = baseUrl.includes('?') ? '&' : '?';
  const upstreamUrl = `${baseUrl}${separator}token=${encodeURIComponent(apiKey)}`;

  try {
    const body = await request.text();
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers: {
        'Content-Type': contentType,
        'Accept': 'application/json',
      },
      body,
    });

    const text = await response.text();
    const upstreamContentType = response.headers.get('content-type');
    return {
      status: response.status,
      headers: upstreamContentType ? { 'Content-Type': upstreamContentType } : undefined,
      body: text,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[hupie proxy] upstream request failed:', message);
    return { status: 502, jsonBody: { error: 'Upstream Hupie request failed', detail: message } };
  }
}
