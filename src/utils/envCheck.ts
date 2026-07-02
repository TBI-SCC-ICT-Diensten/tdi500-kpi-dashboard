/**
 * Checks required environment variables at app startup.
 * Logs warnings for missing non-critical keys and errors for critical ones.
 * Called once in index.tsx.
 */
export function checkEnvironment(): void {
  // Static key access only. A DYNAMIC import.meta.env[var] lookup forces Vite to
  // inline the ENTIRE env object (every VITE_ var) into the client bundle, which
  // leaks any VITE_-prefixed secret present at build time. Reference each key
  // literally so Vite replaces just that one value.
  if (!import.meta.env.VITE_KNMI_API_KEY) {
    console.debug('[ENV] KNMI Data Platform key niet ingesteld (VITE_KNMI_API_KEY) — optionele functie');
  }

  // Note: Hupie, BAG and EP-online keys are server-side only (api/*.ts) —
  // cannot check them from the client.
  if (import.meta.env.DEV) {
    console.info('[ENV] Development mode — Vite proxy actief voor EP-online');
  } else {
    console.info('[ENV] Production mode — Vercel serverless proxy actief voor EP-online');
  }
}
