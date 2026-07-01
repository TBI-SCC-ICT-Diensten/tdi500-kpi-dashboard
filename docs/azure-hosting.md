# Azure Hosting — TDI 500 KPI Dashboard

> **Provisioning-spec voor SSC-ICT.** Dit document beschrijft welke Azure-resources
> nodig zijn om deze applicatie te draaien, met naamgeving, tags en de volledige
> env-/secret-mapping. **Dit document maakt zelf niets aan** — het is een specificatie
> waar een mens (SSC-ICT) naar handelt. Er zijn geen `az`/Terraform/Bicep-commando's
> uitgevoerd en er is geen cloud-verbinding geopend bij het opstellen.

**Bron van waarheid:** een read-only survey van de repo op commit-niveau van branch
`develop`. Codeverwijzingen hebben de vorm `pad:regel` en zijn letterlijk. De
platform-feiten over Azure Static Web Apps (SWA) zijn geverifieerd tegen de actuele
Microsoft Learn-documentatie (zie [§11 Bronnen](#11-bronnen)).

---

## 0. Samenvatting & scope

- **Wat migreert:** de Vite/React SPA (statische hosting) + de drie serverless proxies
  in `api/*.ts` (Hupie, BAG, EP-online). Migratie **weg van Vercel**.
- **Doelplatform:** Azure Static Web Apps (SWA), **Standard-plan**, regio **West Europe**.
- **Geen database.** De app is een read-through proxy — geen PostgreSQL (anders dan het
  referentieproject).
- **Secrets:** Azure Key Vault, uitgelezen via **system-assigned managed identity** —
  nooit in de client-bundle, nooit als platte app-setting.
- **Observability:** Application Insights.
- **⚠️ Eén verplichte verfijning van de besliste architectuur** (zie **§1**):
  de API moet **Bring Your Own Functions (BYOF)** worden — een losstaande Azure Function
  App die als `/api`-backend aan de SWA wordt gekoppeld — en **niet** SWA *managed*
  functions. Reden: SWA managed functions ondersteunen **géén** managed identity en
  **géén** Key Vault references, en hebben een **~45s** time-out die botst met de **60s**
  Hupie-calls van de app. BYOF lost beide op en is exact wat Microsoft hiervoor
  aanraadt. De *intentie* van de besliste architectuur (SWA + Azure Functions + Key
  Vault + managed identity + geen secrets in de bundle) blijft volledig overeind.

---

## 1. ⚠️ Architectuur-beslispunt (verplicht lezen)

De opdracht beschrijft **SWA met geïntegreerde *managed* functions**, waarbij de
managed-functions-API secrets uit Key Vault leest via managed identity. Uit verificatie
tegen de actuele Microsoft-documentatie blijkt dat die combinatie **niet bouwbaar is
zoals letterlijk omschreven**. Twee onafhankelijke, geverifieerde beperkingen wijzen
allebei naar dezelfde oplossing.

### 1.1 Managed functions ⇏ managed identity / Key Vault

De officiële feature-matrix (`apis-functions`, bijgewerkt 2026-06-02) zet dit hard neer:

| Feature | Managed functions | Bring Your Own Functions |
| --- | --- | --- |
| Hosting-plan | **Consumption only** | Consumption / Premium / Dedicated |
| Triggers/bindings | **HTTP only** | Alle |
| **Managed identity** | **✕** | ✔ |
| **Key Vault references** | **✕** | ✔ |

En de Key-Vault-handleiding (`key-vault-secrets`) stelt letterlijk:

> *"Key Vault integration is not available for: … Static web apps using managed functions."*
> *"Azure Serverless Functions do not support direct Key Vault integration."*
> *"Using managed identity is only available in the Azure Static Web Apps Standard plan."*

→ Met **managed** functions kan de API **niet** via managed identity uit Key Vault lezen.
Dat is precies de kern van de besliste secret-architectuur.

### 1.2 De ~45s time-out botst met de 60s Hupie-calls

Managed functions draaien uitsluitend op het **Consumption**-plan en zitten achter een
SWA-gateway met een bekende **~45 seconden** responslimiet (het gedocumenteerde
"500 na 45s"-gedrag). De app hanteert een **60s** time-out op álle Hupie-calls
(list, detail én update):

- `src/services/hupieApi.ts:76` — list-client `timeout: 60000`
- `src/services/hupieApi.ts:89` — detail-client `timeout: 60000`
- `src/services/hupieApi.ts:105` — update-client `timeout: 60000`

→ Een trage Hupie-call (tot 60s) zou door managed functions op ~45s met een 500
afgekapt worden, terwijl de client nog wacht. BYOF (Premium/Dedicated of Flex
Consumption) heeft deze gateway-limiet niet (wél de Azure load-balancer idle-limiet van
230s, ruim boven 60s).

### 1.3 Besluit: Bring Your Own Functions (BYOF)

Beide punten worden opgelost door **één** verfijning, die Microsoft expliciet aanraadt:

> *"If you need managed identity or Key Vault references in your API, use the bring your
> own Functions app feature to use a separate Functions app that uses managed identity."*

**Aanpak:** een losstaande **Azure Function App** (`func-tdi500-{env}`) met een backing
storage account, gekoppeld aan de SWA via **Settings → APIs → Link** als de
`/api`-backend. Vereist het SWA **Standard**-plan.

| Aspect | Managed functions (besliste tekst) | **BYOF (aanbevolen, bouwbaar)** |
| --- | --- | --- |
| Managed identity → Key Vault | ✕ niet mogelijk | ✔ system-assigned identity + KV references |
| 60s Hupie-call | ✕ ~45s afkap | ✔ geen 45s-limiet |
| Extra resources | geen | Function App + Storage account (+ hosting-plan) |
| Deploy | door SWA beheerd | eigen deploy-workflow voor de Function App |
| Koppelmechanisme | ingebouwd | `api_location: ""` + portal-**Link** |

De rest van dit document is opgesteld rond **BYOF**. Waar een keuze de provisioning
raakt, is dat gemarkeerd. **Dit is het #1 punt dat SSC-ICT/Marvel moet bevestigen vóór
provisioning.**

> **Randvoorwaarden BYOF** (uit `functions-bring-your-own`): de gekoppelde Function App
> mag **geen IP-restricties** en **geen private link/service endpoints** hebben (SWA
> proxyt er publiek naartoe); moet de default **`/api`**-routeprefix in `host.json`
> behouden; er kan **één** Function App per SWA gekoppeld worden; koppelen zet
> `api_location` op `""` in de build-workflow. Het koppelen maakt automatisch een
> identity provider *"Azure Static Web Apps (Linked)"* aan zodat alleen de SWA de API mag
> aanroepen.

---

## 2. Overzicht & architectuur

De frontend is een Vite/React 18 SPA (MUI 5) die na `npm run build` statische assets
naar `dist/` schrijft. Client-side routing (react-router-dom) vereist een SPA-fallback
naar `/index.html`. Drie server-side proxies verbergen de upstream-API-keys voor de
browser; twee publieke API's (PDOK, Open-Meteo) worden direct vanuit de browser
aangeroepen (CORS-open, geen key).

```
                       ┌─────────────────────────────────────────────┐
   Browser (SPA)  ───► │  Azure Static Web Apps (stapp-tdi500-{env})  │
   React/Vite/MUI      │  • statische assets uit dist/                │
                       │  • navigationFallback → /index.html          │
                       └───────────────┬─────────────────────────────┘
                                       │  /api/*  (proxy naar linked backend)
                                       ▼
                       ┌─────────────────────────────────────────────┐
                       │  Azure Function App (func-tdi500-{env})      │
   system-assigned ◄───┤  • hupie / bag / ep-online (HTTP-triggers)   │
   managed identity    │  • leest secrets via Key Vault references    │
                       └───┬───────────────────────────┬─────────────┘
                           │ @Microsoft.KeyVault(...)   │  fetch()
                           ▼                            ▼
              ┌────────────────────────┐   ┌──────────────────────────────────┐
              │ Key Vault              │   │ Externe upstreams:                │
              │ (kv-tdi500-{env})      │   │ • Hupie SPARQL (HUPIE_API_URL)    │
              │ • hupie-api-key        │   │ • api.bag.kadaster.nl             │
              │ • bag-api-key          │   │ • public.ep-online.nl             │
              │ • ep-online-api-key    │   └──────────────────────────────────┘
              └────────────────────────┘
                                       ▲
   Browser (SPA) ──────────────────────┘  direct, publiek, géén key/proxy:
                                          • api.pdok.nl (Locatieserver)
                                          • api.open-meteo.com (weer)

   Telemetrie: SWA + Function App → Application Insights (appi-tdi500-{env})
```

### Vercel → Azure mapping

| Vercel (huidig) | Azure (doel) |
| --- | --- |
| Statische hosting (`outputDirectory: dist`) | Static Web Apps — statische app (`dist/`) |
| `api/*.ts` serverless functions | **Bring Your Own** Azure Function App, gekoppeld als `/api` |
| Env-secrets in Vercel-dashboard (`HUPIE_API_KEY`, `BAG_API_KEY`, `EP_ONLINE_API_KEY`) | Key Vault-secrets, via managed identity als KV-references |
| Publieke env (`VITE_*`) in Vercel-build | SWA build-configuratie (build-time env) |
| `vercel.json` rewrites (SPA-fallback + `/ep-online/*`) | `staticwebapp.config.json` (`navigationFallback` + `routes`) |
| `vercel.json` CORS-headers op `/api/*` | Niet nodig (same-origin via `/api`) / `staticwebapp.config.json` `globalHeaders` |

---

## 3. Resource-lijst

Regio voor alles: **West Europe** (`westeurope`). Env-suffix: `dev` | `prod`.

| Resourcetype | Naam (dev) | Naam (prod) | Doel | Notities / limieten |
| --- | --- | --- | --- | --- |
| Resource group | `rg-tdi500-dev` | `rg-tdi500-prod` | Container voor alle TDI500-resources per env | CAF-prefix `rg-`. |
| Static Web App | `stapp-tdi500-dev` | `stapp-tdi500-prod` | Statische SPA-hosting + `/api`-routing | **Standard-plan** (vereist voor BYOF-koppeling + managed identity). CAF-afkorting `stapp-` (zie [§3.1](#31-naamgevingsregel)). Naam ≤ 60 tekens; globaal uniek als `*.azurestaticapps.net`. |
| Function App (BYOF) | `func-tdi500-dev` | `func-tdi500-prod` | De `api/*`-proxies als HTTP-triggers | **Flex Consumption** (aanbevolen) of Premium. Globaal uniek als `*.azurewebsites.net`, ≤ 60 tekens. System-assigned managed identity **aan**. |
| Storage account | `sttdi500dev` | `sttdi500prod` | **Verplichte** backing-storage voor de Function App | Lowercase, geen koppeltekens, 3–24 tekens, **globaal uniek**. `sttdi500prod` = 12 tekens ✔. Zie [§3.2](#32-globale-uniciteit) bij botsing. Alleen nodig door BYOF. |
| App Service Plan | `asp-tdi500-dev` | `asp-tdi500-prod` | Hosting-plan voor de Function App | Alleen als **Premium/Dedicated** gekozen wordt; **Flex Consumption** heeft geen los plan-resource nodig. |
| Key Vault | `kv-tdi500-dev` | `kv-tdi500-prod` | Server-side secrets | 3–24 tekens, alfanumeriek + koppeltekens, begint met letter, **globaal uniek**. `kv-tdi500-prod` = 14 tekens ✔. Zie [§3.2](#32-globale-uniciteit). |
| Application Insights | `appi-tdi500-dev` | `appi-tdi500-prod` | Logging/telemetrie SWA + Function App | CAF-afkorting `appi-`. Koppel aan een Log Analytics-workspace (workspace-based; classic is EOL). |
| Log Analytics workspace | `log-tdi500-dev` | `log-tdi500-prod` | Backing-workspace voor App Insights | Vereist voor workspace-based App Insights. |

> **Géén PostgreSQL / database.** De app houdt geen state; alle data komt live uit de
> upstream-API's. Het enige storage account is de technische backing-store die een Azure
> Function App altijd nodig heeft — niet voor applicatiedata.

### 3.1 Naamgevingsregel

Gevolgde regel: **Microsoft Cloud Adoption Framework (CAF) resource-afkortingen**, met
`{purpose}=tdi500` en `{env}=dev|prod`, in de vorm `{afkorting}-tdi500-{env}`. Dit
spiegelt de SSC-ICT `tbi-ai-portaal`-conventie.

- Static Web App: CAF schrijft **`stapp-`** voor → **`stapp-tdi500-{env}`** (aanbevolen).
  Alternatief dat sommige teams hanteren is `swa-tdi500-{env}`; `stapp-` volgt de
  officiële CAF-lijst en heeft de voorkeur. **Kies er één en houd het consistent.**
- Function App: CAF **`func-`**. App Service Plan: CAF **`asp-`**.
- Key Vault `kv-`, App Insights `appi-`, Log Analytics `log-`, Storage `st` (geen
  koppelteken toegestaan), Resource group `rg-`.

### 3.2 Globale uniciteit

Key Vault, Storage account, Function App en Static Web App hebben een **globaal unieke**
naam nodig (over álle Azure-tenants). De voorgestelde namen passen binnen de
tekenlimieten, maar kunnen al bezet zijn. Bij een botsing — voeg een korte, stabiele
discriminator toe, bijvoorbeeld:

- Key Vault: `kv-tdi500-prod-we` of `kv-tdi500-prod-01` (≤ 24 tekens).
- Storage: `sttdi500prod01` of een korte hash (`sttdi500prodx7q`), lowercase, ≤ 24.
- Function App / SWA: `func-tdi500-prod-we` / `stapp-tdi500-prod-we`.

Documenteer de uiteindelijk gekozen namen terug in dit bestand na provisioning.

---

## 4. Tags

**PROPOSED — pas aan naar SSC-ICT-voorkeur.** SSC-ICT heeft (voor zover bekend uit deze
repo) geen verplicht tag-schema; onderstaande is een redelijke CAF-uitgelijnde set. Pas
toe op de **resource group** en op elke resource. Waarden gemarkeerd met `<…>` zijn
placeholders die de provisioner moet invullen.

| Tag-key | Waarde (dev) | Waarde (prod) | Opmerking |
| --- | --- | --- | --- |
| `project` | `tdi500` | `tdi500` | Vast. |
| `environment` | `dev` | `prod` | Vast. |
| `owner` | `<team/email>` | `<team/email>` | **Placeholder** — invullen (bv. TDI500-team of Klaas Andries). |
| `managed-by` | `ssc-ict` | `ssc-ict` | Provisioning/beheer door SSC-ICT. |
| `cost-center` | `<tbd>` | `<tbd>` | **Placeholder** — SSC-ICT kostenplaats. |
| `data-classification` | `<tbd>` | `<tbd>` | **Placeholder.** Let op: de app proxyt adres-/energielabeldata (BAG/EP-online) → waarschijnlijk minimaal *Internal*, mogelijk *Confidential*; bepaal i.o.m. privacy/DPIA. |
| `repo` | `https://github.com/TBI-SCC-ICT-Diensten/tdi500-kpi-dashboard` | idem | Herkomst. |

---

## 5. Environment variables & secrets

Volledige inventaris van elke env-var die de app leest, build-time én runtime,
geclassificeerd. **In dit document staan uitsluitend namen — nooit secret-waarden.**

### 5.1 Server-side secrets → Key Vault

Uitgelezen door de Function App (na migratie hetzelfde `process.env`-leespatroon; alleen
de bron van de waarde wordt een Key Vault reference).

| Env-var (app-setting) | Gelezen op | Voorgestelde KV-secretnaam | App-setting-waarde (KV reference) |
| --- | --- | --- | --- |
| `HUPIE_API_KEY` | `api/hupie.ts:39` | `hupie-api-key` | `@Microsoft.KeyVault(SecretUri=https://kv-tdi500-{env}.vault.azure.net/secrets/hupie-api-key/)` |
| `BAG_API_KEY` | `api/bag.ts:21` | `bag-api-key` | `@Microsoft.KeyVault(SecretUri=https://kv-tdi500-{env}.vault.azure.net/secrets/bag-api-key/)` |
| `EP_ONLINE_API_KEY` | `api/ep-online.ts:7` | `ep-online-api-key` | `@Microsoft.KeyVault(SecretUri=https://kv-tdi500-{env}.vault.azure.net/secrets/ep-online-api-key/)` |
| `HUPIE_API_URL` | `api/hupie.ts:40` | *(geen secret — zie noot)* | Platte app-setting **óf** KV-secret `hupie-api-url` |

> **`HUPIE_API_URL`** is een **endpoint-URL, geen credential**. Het mag een platte
> Function-App-app-setting zijn. Het co-lokaliseren in Key Vault (`hupie-api-url`) houdt
> alle Hupie-config op één plek — keuze aan SSC-ICT. De proxy verwacht de **`/query/`**
> -variant en wisselt intern naar `/update/` voor SPARQL UPDATE (`api/hupie.ts:53-55`).

**Managed-identity-toegang.** Zet op de Function App een **system-assigned managed
identity** aan en geef die identity leesrechten op de Key Vault. Twee equivalente wegen:

- **RBAC (aanbevolen):** rol **`Key Vault Secrets User`** op de identity, scope = de Key
  Vault (vereist dat de Key Vault op het RBAC-autorisatiemodel staat).
- **Access policy:** *Get* op *Secrets* voor de identity (bij het legacy
  access-policy-model).

De Key Vault reference-syntax kent twee vormen; beide toegestaan:

```text
@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/<secret>/)
@Microsoft.KeyVault(VaultName=<vault>;SecretName=<secret>)
```

### 5.2 Publieke build-time env (VITE_*) → SWA build-configuratie

VITE_-prefixed en dus **in de client-bundle gebakken** — geen secrets. Horen in de
SWA-buildconfiguratie (build-time environment), **niet** in Key Vault.

| Env-var | Gelezen op | Doel |
| --- | --- | --- |
| `VITE_API_TIMEOUT` | `src/config/index.ts:6` | Time-out (ms) voor de list-query; default 30000. |
| `VITE_USE_MOCK_DATA` | `src/services/hupieApi.ts:41`, `src/services/mockData.ts:10` | Default databron. `.env.production:1` zet `false` (prod draait live). |

> **`VITE_ENABLE_MOCK_TOGGLE`** staat in `.env.production:2` (`=true`) maar wordt door
> **geen enkele** broncode gelezen (geverifieerd: komt alleen in `.env.production` voor).
> Het is dead config / een no-op. **Niet provisionen** in Azure tenzij eerst een
> consumer in de code wordt toegevoegd.

### 5.3 Dev-only (lokale Vite-proxy) → NIET in Azure zetten

Deze VITE_-secrets bestaan uitsluitend voor de lokale dev-proxy in `vite.config.ts`. In
productie worden dezelfde upstreams server-side geproxyd via `api/*.ts` met de
niet-VITE_ keys hierboven. **Nooit in enige Azure-scope zetten** — het zijn
VITE_-vars die in de bundle zouden lekken (dit is de kern van de #138-fix).

| Env-var | Gelezen op | Status |
| --- | --- | --- |
| `VITE_EP_ONLINE_API_KEY` | `vite.config.ts:24` | Alleen lokale dev-proxy. Prod gebruikt `api/ep-online.ts` + `EP_ONLINE_API_KEY`. **Niet provisionen.** |
| `VITE_KNMI_API_KEY` | `vite.config.ts:32`, `src/utils/envCheck.ts:11` | **Vestigiaal.** Geen code roept KNMI aan; het weer komt van Open-Meteo (`src/services/weatherService.ts:13`). `envCheck` logt enkel een optionele-feature-debugregel. **Niet provisionen.** |

> **Cross-check met #138 & `.env.example`.** `src/utils/envCheck.ts:7-11` gebruikt
> *statische* `import.meta.env.VITE_KNMI_API_KEY`-toegang — dit is de #138-fix die
> voorkomt dat Vite het hele env-object (en dus elk VITE_-secret) inlijnt. `.env.example`
> (regels 5-9) documenteert al: *"VITE_ secrets here are for the LOCAL DEV PROXY ONLY —
> never set them in any Vercel scope."* **Neem diezelfde waarschuwing mee naar Azure.**

### 5.4 Rotatie bij cutover (vlag)

- **`HUPIE_API_KEY`** — er staat al een sleutelrotatie met Klaas Andries open. Voer de
  **nieuwe** sleutel direct in Key Vault (`hupie-api-key`) in bij cutover; de Function
  App pikt hem op via de reference zonder redeploy. Key Vault maakt dit een
  éénpuntswijziging.
- **`BAG_API_KEY` / `EP_ONLINE_API_KEY`** — bij voorkeur vers aanmaken in Key Vault bij
  cutover in plaats van uit Vercel te kopiëren, zodat de oude Vercel-scope daarna
  ingetrokken kan worden.

---

## 6. API-port checklist (Vercel → Azure Functions)

De drie handlers zijn `@vercel/node` default-exports. Onder BYOF worden het HTTP-triggers
in een Azure Function App (Node.js v4 programmeermodel aanbevolen). **Dit is een
to-do-lijst voor de latere code-PR — hier niet uitgevoerd.**

Handlers (volledig; bevestigd via `api/*.ts`):

| Handler | Client-aanroep | Method | Upstream | Secret |
| --- | --- | --- | --- | --- |
| `api/hupie.ts` | `/api/hupie` (`src/config/index.ts:5`, axios-baseURL `src/services/hupieApi.ts:75`) | POST | `HUPIE_API_URL` (+ `?token=`), `/query/` → `/update/` op Content-Type | `HUPIE_API_KEY` |
| `api/bag.ts` | `/api/bag?postcode=…&huisnummer=…&exacteMatch=true` (`src/services/bagService.ts:108`) | GET | `api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/adressenuitgebreid` (`api/bag.ts:15`) | `BAG_API_KEY` (header `X-Api-Key`) |
| `api/ep-online.ts` | `/ep-online/api/v5/…` → rewrite → `/api/ep-online?subpath=…` (`src/services/bagService.ts:62,245`; `vercel.json:7-8`) | GET | `public.ep-online.nl/<subpath>` (`api/ep-online.ts:33`) | `EP_ONLINE_API_KEY` (header `Authorization`) |

Vertaalpunten (elk een taak, niet hier uitgevoerd):

- [ ] **Types/handtekening:** `@vercel/node` `VercelRequest`/`VercelResponse` →
  Azure Functions v4 `HttpRequest`/`HttpResponseInit`; default-export handler →
  `app.http('hupie', { methods, authLevel, handler })`.
- [ ] **Raw body (Hupie):** `export const config = { api: { bodyParser: false } }`
  (`api/hupie.ts:21`) en het stream-lezen (`api/hupie.ts:29`) → Azure `await request.text()`
  voor de ruwe SPARQL-body (Content-Type kan `application/sparql-query` of
  `application/sparql-update` zijn).
- [ ] **Query/URL-parsing:** `req.query['subpath']` (`api/ep-online.ts:15`) en het handmatig
  splitsen van `req.url` (`api/bag.ts:31-32`, `api/ep-online.ts:23-24`) →
  `request.query.get('subpath')` / `new URL(request.url)`.
- [ ] **Response:** `res.status().send()/.json()/.setHeader()` → return een
  `HttpResponseInit { status, headers, body }`. Behoud het **verbatim doorsturen** van
  upstream-status + body (`api/hupie.ts:71-75`), inclusief de 200-met-foutbody die
  `RateLimitError`/`ManufacturerServerError` aandrijft (`src/services/hupieApi.ts:264-275`).
- [ ] **Secrets:** `process.env['HUPIE_API_KEY']` e.d. blijven `process.env`-reads; alleen
  de bron wordt een Key Vault reference-app-setting (§5.1).
- [ ] **Routing/rewrites → `staticwebapp.config.json`:**
  - SPA-fallback `vercel.json:11-12` (`/((?!api/).*)` → `/index.html`) → `navigationFallback`
    met `exclude: ["/api/*", "/assets/*", "/*.{js,css,svg,png,ico,woff2}"]`.
  - EP-online-rewrite `vercel.json:7-8` (`/ep-online/(.*)` → `/api/ep-online?subpath=$1`) →
    een `routes`-rewrite reproduceren, **óf** (schoner) de client `EP_PROXY`
    (`src/services/bagService.ts:62`) laten wijzen naar `/api/ep-online?subpath=api/v5/…`.
    Kies één; documenteer de keuze.
  - CORS-headers `vercel.json:16-24`: same-origin `/api` heeft geen CORS nodig; alleen
    toevoegen als een externe consumer verwacht wordt (`globalHeaders`).
- [ ] **Build-config Function App:** `api/tsconfig.json` (`module: CommonJS`,
  `outDir: ../dist-api`) → afstemmen op het Azure Functions Node-buildmodel.
- [ ] **`api_location: ""`** in de SWA-buildworkflow zetten (verplicht vóór het koppelen
  van BYOF) en de default **`/api`**-prefix in de Function App `host.json` behouden.

---

## 7. Outbound dependencies (netwerk/firewall)

Voor wie provisioned/netwerk inricht — informatief, niets configureren.

| Upstream | Host | Via | Auth | Notities |
| --- | --- | --- | --- | --- |
| Hupie SPARQL | `HUPIE_API_URL` (Azure-gehost, per opdracht) | Function App (`api/hupie.ts`) | `?token=` query-param | 60s time-out; retourneert 200-met-foutbody bij rate-limit. |
| BAG Individuele Bevragingen | `api.bag.kadaster.nl` | Function App (`api/bag.ts`) | header `X-Api-Key` | `Accept-Crs: epsg:28992`, `Accept: application/hal+json`. |
| EP-online | `public.ep-online.nl` | Function App (`api/ep-online.ts`) | header `Authorization` (rauwe key) | `User-Agent: TDI500-Dashboard/1.0` verplicht. |
| PDOK Locatieserver | `api.pdok.nl` | **direct uit browser** | geen (publiek) | `src/services/bagService.ts:56`; CORS-open, geen proxy/key. |
| Open-Meteo | `api.open-meteo.com` | **direct uit browser** | geen (publiek) | `src/services/weatherService.ts:13`; CORS-open, geen key. |
| ~~KNMI Data Platform~~ | `api.dataplatform.knmi.nl` | alleen dev-proxy | — | **Vestigiaal — niet in productie gebruikt.** Zie §5.3. |
| Google Fonts | `fonts.googleapis.com` / `fonts.gstatic.com` | direct uit browser | geen | `index.html:7-9` (Inter font). |

> **IP-allowlisting (vraag voor de provisioner):** als Hupie/Triple Solar
> IP-allowlisting afdwingt, moeten de **uitgaande IP's van de Function App** (of een
> NAT-gateway) bij hen geregistreerd worden. BYOF op Flex Consumption/Premium heeft
> voorspelbare outbound-IP's of kan VNet-integratie gebruiken. **Let op de tegengestelde
> eis:** de Function App zelf mag géén *inbound* IP-restricties of private link hebben
> (SWA-koppeling vereist publieke bereikbaarheid — §1.3).

---

## 8. Observability & config

- **Logging vandaag:** overal `console.*` (server-side in `api/hupie.ts`, `api/bag.ts`,
  `api/ep-online.ts`; client-side o.a. `src/services/bagService.ts`,
  `src/services/hupieApi.ts:128`, `src/services/weatherService.ts:109`). Geen structured
  telemetry, geen App Insights SDK aanwezig.
- **App Insights aansluiten:** zet **Application Insights aan op de SWA** (dekt de
  statische app) én **op de Function App** (dekt de API; `console.*` in de functions
  stroomt dan automatisch naar App Insights). App-setting
  `APPLICATIONINSIGHTS_CONNECTION_STRING` op de Function App (mag KV-referenced, maar de
  connection string is geen hard secret).
- **Time-out/limieten:** de 60s Hupie-time-out (`src/services/hupieApi.ts:76,89,105`) is
  de reden dat BYOF nodig is (§1.2). Onder BYOF geldt de Azure load-balancer idle-limiet
  van **230s** — ruim boven 60s, dus geen probleem. Zorg dat het gekozen Function-App-plan
  een functie-time-out ≥ 60s toestaat (Flex Consumption/Premium: prima).

---

## 9. Cutover — geordende checklist

**Alle stappen zijn HUMAN/SSC-ICT-acties.** Dit document provisioned niets. Per env
(`dev`, daarna `prod`).

1. [ ] **Bevestig het architectuur-beslispunt (§1):** BYOF i.p.v. managed functions.
       *(SSC-ICT/Marvel — blokkerend voor de rest.)*
2. [ ] **Resource group** aanmaken: `rg-tdi500-{env}` in `westeurope`, met de tags uit §4.
3. [ ] **Key Vault** `kv-tdi500-{env}` aanmaken (RBAC-model aanbevolen). Secrets invoeren:
       `hupie-api-key` (de **geroteerde** Hupie-sleutel, §5.4), `bag-api-key`,
       `ep-online-api-key`, en optioneel `hupie-api-url`.
4. [ ] **Log Analytics workspace** `log-tdi500-{env}` + **Application Insights**
       `appi-tdi500-{env}` (workspace-based) aanmaken.
5. [ ] **Storage account** `sttdi500{env}` aanmaken (backing-store voor de Function App).
6. [ ] **Function App** `func-tdi500-{env}` aanmaken (Flex Consumption of Premium, Node.js
       LTS), gekoppeld aan het storage account + App Insights. **System-assigned managed
       identity aan.**
7. [ ] **KV-toegang** verlenen: rol `Key Vault Secrets User` op de Function-App-identity,
       scope = `kv-tdi500-{env}` (of access policy *Get/Secrets*). App-settings met de
       KV-references uit §5.1 zetten. **Geen** IP-restricties/private link op de Function App.
8. [ ] **API-port** (aparte code-PR, §6) deployen naar de Function App; default `/api`
       -prefix in `host.json` behouden.
9. [ ] **Static Web App** `stapp-tdi500-{env}` (**Standard-plan**) aanmaken, gekoppeld aan
       de GitHub-repo/branch. Build-config: app-artefact `dist/`, `api_location: ""`.
       Publieke build-time env (§5.2) zetten: `VITE_API_TIMEOUT`, `VITE_USE_MOCK_DATA`.
       **Geen** VITE_-secrets (§5.3).
10. [ ] **BYOF koppelen:** SWA → Settings → APIs → Production → **Link** → Function App
        `func-tdi500-{env}`.
11. [ ] **`staticwebapp.config.json`** toevoegen (SPA-fallback + eventuele EP-online-route,
        §6).
12. [ ] **Verifiëren:** SPA laadt en routeert (deep-link refresh werkt); `/api/hupie`,
        `/api/bag`, `/ep-online/*` geven live data; secrets zitten **niet** in de
        client-bundle (grep de gepubliceerde `dist/` op key-namen); App Insights ontvangt
        traces; een trage Hupie-call > 45s wordt niet afgekapt.
13. [ ] **Vercel afbouwen:** na groen op prod de oude Vercel-deployment + env-scopes
        intrekken en de stale alias `tdi500-kpi-dashboard.vercel.app` verwijderen.

---

## 10. Repo-observaties die provisioning raken

- **Node-versie is nergens gepind:** geen `engines` in `package.json`, geen `.nvmrc`,
  geen CI-workflow (alleen `.github/dependabot.yml`). `@vercel/node@^5.8.22` impliceert
  Node 20/22-klasse. **Aanbeveling:** pin Node 20 LTS voor zowel de SWA-build als de
  Function-App-runtime, en voeg `engines.node` toe (aparte kleine PR).
- **Build:** `npm run build` = `tsc && vite build` (`package.json:8`) → `dist/`
  (`vercel.json:4`). `type: module` (ESM).
- **Prod-defaults in de bundle:** `.env.production` bakt `VITE_USE_MOCK_DATA=false` in
  (prod draait live) en `VITE_ENABLE_MOCK_TOGGLE=true` (ongebruikt — §5.2).

---

## 11. Bronnen

Geverifieerd tegen de actuele Microsoft Learn-documentatie (juli 2026):

- [API support in Azure Static Web Apps with Azure Functions](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-functions) — feature-matrix: managed functions ✕ managed identity / ✕ Key Vault references / Consumption-only / HTTP-only.
- [Secure authentication secrets in Azure Key Vault for Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/key-vault-secrets) — "Key Vault integration is not available for … Static web apps using managed functions"; managed identity vereist Standard-plan; KV alleen in productie.
- [Bring your own functions to Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own) — Standard-plan vereist; koppelmechanisme; `api_location: ""`; geen IP-restricties/private link; één Function App per SWA; HTTP-only.
- [Use Key Vault references as app settings (App Service/Functions)](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references) — `@Microsoft.KeyVault(...)`-syntax.
- [Static Web Apps hosting plans](https://learn.microsoft.com/en-us/azure/static-web-apps/plans) — Standard vs Free feature-verschillen.
- [Azure resource naming — CAF abbreviations](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations) — `stapp-`, `func-`, `kv-`, `appi-`, `asp-`, `log-`, `st`, `rg-`.
- SWA managed-functions ~45s gateway-time-out: [Azure/static-web-apps issue #801](https://github.com/Azure/static-web-apps/issues/801) en meerdere Microsoft Q&A-meldingen ("500 na 45s").
