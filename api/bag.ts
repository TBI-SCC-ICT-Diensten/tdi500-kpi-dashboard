import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy for the BAG Individuele Bevragingen API (VV-26).
 *
 * Moves the BAG API key out of the client bundle: the browser calls
 * /api/bag?postcode=...&huisnummer=...&exacteMatch=true and this function
 * forwards to the Kadaster adressenuitgebreid endpoint with X-Api-Key
 * (BAG_API_KEY) attached server-side.
 *
 * Only the Kadaster call is proxied. PDOK Locatieserver (public, no key)
 * and EP-online (already proxied via /ep-online) keep calling directly.
 */

const BAG_API_BASE = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const apiKey = process.env['BAG_API_KEY'];

  if (!apiKey) {
    console.error('[bag proxy] BAG_API_KEY not configured');
    res.status(500).json({ error: 'BAG_API_KEY not configured on server' });
    return;
  }

  // Forward the incoming query string to the BAG adressenuitgebreid endpoint.
  const rawUrl = req.url ?? '/';
  const queryStart = rawUrl.indexOf('?');
  const queryString = queryStart >= 0 ? rawUrl.slice(queryStart + 1) : '';
  const upstreamUrl = `${BAG_API_BASE}/adressenuitgebreid${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: req.method ?? 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/hal+json',
        'Accept-Crs': 'epsg:28992',
      },
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    res.status(response.status).send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[bag proxy] upstream request failed:', message);
    res.status(502).json({ error: 'Upstream BAG request failed', detail: message });
  }
}
