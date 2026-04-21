/**
 * Checks required environment variables at app startup.
 * Logs warnings for missing non-critical keys and errors for critical ones.
 * Called once in index.tsx.
 */
export function checkEnvironment(): void {
  const required = [
    { key: 'VITE_BAG_API_KEY',   label: 'BAG API',      critical: false },
  ];

  const optional = [
    { key: 'VITE_KNMI_API_KEY',  label: 'KNMI Data Platform' },
  ];

  const missing = required.filter(
    (v) => !import.meta.env[v.key]
  );

  if (missing.length > 0) {
    missing.forEach((v) => {
      const level = v.critical ? 'error' : 'warn';
      console[level](
        `[ENV] ${v.label} key ontbreekt (${v.key}) — ` +
        `${v.critical ? 'kritieke functionaliteit uitgeschakeld' : 'beperkte functionaliteit'}`
      );
    });
  }

  optional.forEach((v) => {
    if (!import.meta.env[v.key]) {
      console.debug(`[ENV] ${v.label} key niet ingesteld (${v.key}) — optionele functie`);
    }
  });

  // Note: EP_ONLINE_API_KEY is server-side only — cannot check from client
  if (import.meta.env.DEV) {
    console.info('[ENV] Development mode — Vite proxy actief voor EP-online');
  } else {
    console.info('[ENV] Production mode — Vercel serverless proxy actief voor EP-online');
  }
}
