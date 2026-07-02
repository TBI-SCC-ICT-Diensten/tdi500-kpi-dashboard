import type { HttpRequest, HttpResponseInit } from '@azure/functions';

/**
 * Azure Functions v4 port of the EP-online proxy (VV-26). Behaviour identical to the
 * Vercel handler (api/ep-online.ts): read ?subpath=, forward the remaining query to
 * public.ep-online.nl/<subpath> with the Authorization + User-Agent headers.
 * The host is fixed — subpath only controls the path (no host takeover).
 */
export async function epOnlineHandler(request: HttpRequest): Promise<HttpResponseInit> {
  const apiKey = process.env['EP_ONLINE_API_KEY'];

  if (!apiKey) {
    console.error('[ep-online proxy] EP_ONLINE_API_KEY not set');
    return { status: 500, jsonBody: { error: 'EP_ONLINE_API_KEY not configured on server' } };
  }

  const url = new URL(request.url);
  const subpath = url.searchParams.get('subpath');
  if (!subpath) {
    return { status: 400, jsonBody: { error: 'Missing subpath parameter' } };
  }

  url.searchParams.delete('subpath');
  const remainingQuery = url.searchParams.toString();
  const upstreamPath = '/' + subpath + (remainingQuery ? '?' + remainingQuery : '');
  const upstreamUrl = `https://public.ep-online.nl${upstreamPath}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'TDI500-Dashboard/1.0',
      },
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type');
    return {
      status: response.status,
      headers: contentType ? { 'Content-Type': contentType } : undefined,
      body: text,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ep-online proxy] fetch failed:', message);
    return { status: 502, jsonBody: { error: 'Upstream EP-online request failed', detail: message } };
  }
}
