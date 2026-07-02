import type { HttpRequest, HttpResponseInit } from '@azure/functions';

/**
 * Azure Functions v4 port of the BAG proxy (VV-26). Behaviour identical to the Vercel
 * handler (api/bag.ts): forward the incoming query string to the Kadaster
 * adressenuitgebreid endpoint with the X-Api-Key + Accept/Accept-Crs headers.
 */
const BAG_API_BASE = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2';

export async function bagHandler(request: HttpRequest): Promise<HttpResponseInit> {
  const apiKey = process.env['BAG_API_KEY'];

  if (!apiKey) {
    console.error('[bag proxy] BAG_API_KEY not configured');
    return { status: 500, jsonBody: { error: 'BAG_API_KEY not configured on server' } };
  }

  // Forward the incoming query string verbatim to /adressenuitgebreid.
  const search = new URL(request.url).search; // '?postcode=...&huisnummer=...' or ''
  const upstreamUrl = `${BAG_API_BASE}/adressenuitgebreid${search}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/hal+json',
        'Accept-Crs': 'epsg:28992',
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
    console.error('[bag proxy] upstream request failed:', message);
    return { status: 502, jsonBody: { error: 'Upstream BAG request failed', detail: message } };
  }
}
