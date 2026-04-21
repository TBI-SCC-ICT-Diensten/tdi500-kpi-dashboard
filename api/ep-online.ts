/**
 * Vercel serverless function — EP-online API proxy.
 *
 * Replaces the Vite dev proxy in production.
 * Injects EP_ONLINE_API_KEY server-side so it never reaches
 * the client bundle.
 *
 * Route: /ep-online/* → https://public.ep-online.nl/*
 *
 * In development: Vite's proxy in vite.config.ts handles /ep-online
 * In production:  This function handles /ep-online via vercel.json routing
 *
 * Environment variable required (server-side, no VITE_ prefix):
 *   EP_ONLINE_API_KEY=<your key>
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const apiKey = process.env['EP_ONLINE_API_KEY'];

  if (!apiKey) {
    res.status(500).json({
      error: 'EP_ONLINE_API_KEY not configured on server'
    });
    return;
  }

  // Sub-path passed as query param via vercel.json rewrite
  // e.g. /ep-online/api/v5/PandEnergielabel/Adres?postcode=X&huisnummer=Y
  // becomes ?subpath=api/v5/PandEnergielabel/Adres&postcode=X&huisnummer=Y
  const subpath = req.query['subpath'];
  if (!subpath) {
    res.status(400).json({ error: 'Missing subpath parameter' });
    return;
  }

  // Reconstruct the full query string minus the subpath param
  const url = new URL(req.url ?? '/', 'http://localhost');
  url.searchParams.delete('subpath');
  const remainingQuery = url.searchParams.toString();
  const upstreamPath = '/' + subpath + (remainingQuery ? '?' + remainingQuery : '');

  console.log('[ep-online proxy] subpath:', subpath);
  console.log('[ep-online proxy] upstream path:', upstreamPath);

  const options: https.RequestOptions = {
    hostname: 'public.ep-online.nl',
    path:     upstreamPath,
    method:   req.method ?? 'GET',
    headers: {
      'Authorization': apiKey,
      'Accept':        'application/json',
      'User-Agent':    'TDI500-Dashboard/1.0',
    },
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode ?? 200);

      // Forward relevant headers
      const forwardHeaders = [
        'content-type',
        'cache-control',
        'x-ratelimit-remaining',
      ];
      forwardHeaders.forEach((h) => {
        const v = proxyRes.headers[h];
        if (v) res.setHeader(h, v);
      });

      let body = '';
      proxyRes.setEncoding('utf8');
      proxyRes.on('data', (chunk: string) => { body += chunk; });
      proxyRes.on('end', () => {
        res.send(body);
        resolve();
      });
    });

    proxyReq.on('error', (err: Error) => {
      console.error('[ep-online proxy] upstream error:', err.message);
      res.status(502).json({ error: 'Upstream EP-online request failed' });
      resolve();
    });

    proxyReq.end();
  });
}
