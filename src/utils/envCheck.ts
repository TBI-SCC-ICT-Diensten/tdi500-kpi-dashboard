/**
 * Checks required environment variables at app startup.
 * Logs warnings for missing non-critical keys and errors for critical ones.
 * Called once in index.tsx.
 */
export function checkEnvironment(): void {
  const optional = [
    { key: 'VITE_KNMI_API_KEY',  label: 'KNMI Data Platform' },
  ];

  optional.forEach((v) => {
    if (!import.meta.env[v.key]) {
      console.debug(`[ENV] ${v.label} key niet ingesteld (${v.key}) — optionele functie`);
    }
  });

  // Note: Hupie, BAG and EP-online keys are server-side only (api/*.ts) —
  // cannot check them from the client.
  if (import.meta.env.DEV) {
    console.info('[ENV] Development mode — Vite proxy actief voor EP-online');
  } else {
    console.info('[ENV] Production mode — Vercel serverless proxy actief voor EP-online');
  }
}
