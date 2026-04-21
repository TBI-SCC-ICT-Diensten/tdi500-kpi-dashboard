import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const apiKey = process.env['EP_ONLINE_API_KEY'];

  if (!apiKey) {
    console.error('[ep-online proxy] EP_ONLINE_API_KEY not set');
    res.status(500).json({ error: 'EP_ONLINE_API_KEY not configured on server' });
    return;
  }

  const subpath = req.query['subpath'];
  if (!subpath) {
    res.status(400).json({ error: 'Missing subpath parameter' });
    return;
  }

  // Parse query string directly without URL object
  const rawUrl = req.url ?? '/';
  const queryStart = rawUrl.indexOf('?');
  const queryString = queryStart >= 0 ? rawUrl.slice(queryStart + 1) : '';
  const params = new URLSearchParams(queryString);
  params.delete('subpath');
  const remainingQuery = params.toString();
  const upstreamPath = '/' + subpath + (remainingQuery ? '?' + remainingQuery : '');

  console.log('[ep-online proxy] subpath:', subpath);
  console.log('[ep-online proxy] upstream path:', upstreamPath);

  const upstreamUrl = `https://public.ep-online.nl${upstreamPath}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: req.method ?? 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'TDI500-Dashboard/1.0',
      },
    });

    const text = await response.text();

    console.log('[ep-online proxy] upstream status:', response.status);

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    res.status(response.status).send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ep-online proxy] fetch failed:', message);
    res.status(502).json({ error: 'Upstream EP-online request failed', detail: message });
  }
}
