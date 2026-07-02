// Build the Functions project into self-contained CJS bundles.
//
// Each entry (the app.http registration files) is bundled with esbuild, which FOLLOWS
// the ../../../src imports and INLINES the pure shared modules (hupieWriteGuard →
// sparqlQueries + commandRanges) — the same one-source-of-truth pattern Vercel uses.
// @azure/functions stays external (installed as a runtime dependency on the Function App).
// Output: dist/functions/{hupie,bag,ep-online}.js, loaded via package.json "main" glob.
import { build } from 'esbuild';

await build({
  entryPoints: [
    'src/functions/hupie.ts',
    'src/functions/bag.ts',
    'src/functions/ep-online.ts',
  ],
  outdir: 'dist/functions',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: ['@azure/functions'],
  logLevel: 'info',
});
