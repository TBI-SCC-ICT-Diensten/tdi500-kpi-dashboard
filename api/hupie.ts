import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy for the Hupie SPARQL endpoint (VV-26).
 *
 * Moves the Hupie API token out of the client bundle: the browser calls
 * /api/hupie and this function attaches ?token=<HUPIE_API_KEY> server-side,
 * exactly as the old client did (the token is a query param, not a header).
 *
 * Routes read vs write by the incoming Content-Type, mirroring the client:
 *   application/sparql-update -> the Hupie /update/ endpoint
 *   application/sparql-query  -> the Hupie /query/ endpoint (default)
 *
 * The upstream response (status + body) is forwarded verbatim so the client
 * keeps distinguishing 401/500/timeout/empty and can still parse the
 * 200-with-error bodies that drive RateLimitError / ManufacturerServerError.
 */

// Disable Vercel's body parser so the raw SPARQL body is forwarded
// byte-faithfully regardless of its (non-JSON) Content-Type.
export const config = { api: { bodyParser: false } };

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
  const isUpdate = contentType.includes('application/sparql-update');

  // The configured base is the /query/ endpoint; for updates swap /query/ ->
  // /update/ exactly as the old client did.
  const upstreamBase = isUpdate
    ? baseUrl.replace(/\/query\/?$/, '/update/').replace(/\/sparql\/?$/, '/update/')
    : baseUrl;

  const separator = upstreamBase.includes('?') ? '&' : '?';
  const upstreamUrl = `${upstreamBase}${separator}token=${encodeURIComponent(apiKey)}`;

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
