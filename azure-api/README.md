# azure-api — Azure Functions v4 backend (BYOF)

The standalone **Azure Functions (Node v4)** app that the Static Web App
(`stapp-tdi500-dashboard-d-weu-01`) is linked to as its `/api` backend. It ports the
three Vercel proxies (`../api/*.ts`) — Hupie / BAG / EP-online — with **identical
behaviour**, including the RSEC-1 write-guard.

## Why a separate project + deploy

This is **Bring Your Own Functions (BYOF)**, deployed to the standalone Function App
`func-tdi500-dashboard-d-weu`, NOT via SWA managed functions. That preserves the Key
Vault references + system-assigned managed identity already wired on the Function App.

> ⚠️ The SWA frontend workflow (`.github/workflows/azure-static-web-apps-*.yml`) MUST keep
> `api_location` **empty**. Pointing it at this folder routes through SWA managed
> deployment and defeats the BYOF + Key Vault design.

## Structure

- `src/handlers/*.ts` — pure handler functions (`import type` from `@azure/functions`;
  trivially unit-testable). The Hupie handler imports the shared RSEC-1 write-guard from
  `../../../src/services/hupieWriteGuard` — **one source of truth** with the Vercel proxy.
- `src/functions/*.ts` — thin `app.http(...)` registrations (the esbuild entry points).
  Routes: `/api/hupie` (POST), `/api/bag` (GET), `/api/ep-online` (GET). `authLevel:
  'anonymous'` — the SWA linked-provider restricts callers to the SWA.
- `esbuild.mjs` — bundles each function to self-contained CJS, **inlining** the pure
  shared modules (`hupieWriteGuard` → `sparqlQueries`, `commandRanges`), the same
  one-source-of-truth pattern Vercel uses. `@azure/functions` stays external.
- `host.json` keeps the default `api` route prefix (BYOF requires the `/api` path).

## Secrets

Read from `process.env` exactly as the Vercel handlers do — `HUPIE_API_KEY`,
`HUPIE_API_URL`, `BAG_API_KEY`, `EP_ONLINE_API_KEY`. On the Function App these are Key
Vault references (+ one plain setting) resolved by the system-assigned managed identity.
**No Key Vault SDK in code.** For local runs, put them in `local.settings.json`
(gitignored).

## Build / test / run

```bash
npm ci
npm run typecheck   # tsc --noEmit (also type-checks the imported ../src pure modules)
npm run test        # vitest — handler integration tests, upstream fetch mocked
npm run build       # esbuild → dist/functions/*.js
npm start           # func start (needs azure-functions-core-tools installed)
```

## Deploy — OIDC (manual wiring required before first run)

`.github/workflows/azure-functions-api.yml` deploys on push to `develop` touching
`azure-api/**`, via `azure/login@v2` (OIDC) → `Azure/functions-action@v1`. Publish-profile
/ basic-auth is **disabled** and does not work on Flex Consumption (no Kudu/SCM), so OIDC
is required.

**One-time Azure setup (portal/CLI — the workflow only consumes these):**
1. Create a user-assigned managed identity (or app registration).
2. Assign it **Website Contributor** scoped to `func-tdi500-dashboard-d-weu`.
3. Add a **federated credential** with subject
   `repo:TBI-SCC-ICT-Diensten/tdi500-kpi-dashboard:ref:refs/heads/develop`.
4. Add GitHub repo secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.

Until those are wired, the deploy job will fail at the login step (build/typecheck/test
steps still run). If the first deploy reports a plan-detection issue on Flex Consumption,
add `sku: flexconsumption` to the `Azure/functions-action` step.
