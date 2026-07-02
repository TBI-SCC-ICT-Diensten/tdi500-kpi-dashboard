# Azure Hosting — TDI 500 KPI Dashboard

> **Provisioning-spec voor SSC-ICT.** Dit document beschrijft welke Azure-resources
> nodig zijn om deze applicatie te draaien, met naamgeving, tags en de volledige
> env-/secret-mapping, afgestemd op de **TBI Azure Foundation-standaard**. **Dit document
> maakt zelf niets aan** — het is een specificatie waar een mens (SSC-ICT) naar handelt.
> Er zijn geen `az`/Terraform/Bicep-commando's uitgevoerd en er is geen cloud-verbinding
> geopend bij het opstellen.

**Bronnen van waarheid:** (1) de gezaghebbende **"FoundationDesign - TBI - Resource
Organization v1.0"** (InSpark; tenant `tbiholding.onmicrosoft.com`) voor naamgeving,
tags, archetype en governance — zie [§1](#1-tbi-azure-foundation--governance--archetype);
(2) een read-only survey van deze repo op branch `develop` voor de app-specifieke feiten
(codeverwijzingen hebben de vorm `pad:regel` en zijn letterlijk); (3) de actuele Microsoft
Learn-documentatie voor de SWA-platformfeiten (zie [§12 Bronnen](#12-bronnen)).

---

## 0. Samenvatting & scope

- **Wat migreert:** de Vite/React SPA (statische hosting) + de drie serverless proxies
  in `api/*.ts` (Hupie, BAG, EP-online). Migratie **weg van Vercel**.
- **Doelplatform:** Azure Static Web Apps (SWA), **Standard-SKU**, regio **West Europe**
  (`weu`), in een **gevende (vended) subscription** onder het **Online-Isolated**-archetype
  van de TBI-landingszone.
- **Governance:** naamgeving en verplichte tags zijn **door Azure Policy afgedwongen**
  (zie §1). Een ontbrekende verplichte tag of een waarde buiten de toegestane lijst
  **blokkeert de deployment**.
- **Geen database.** De app is een read-through proxy — geen PostgreSQL.
- **Secrets:** Azure Key Vault, uitgelezen via **system-assigned managed identity** —
  nooit in de client-bundle, nooit als platte app-setting.
- **Observability:** Application Insights (workspace-based).
- **⚠️ Eén verplichte verfijning van de besliste architectuur** (zie [§2](#2-architectuur-beslispunt-verplicht-lezen)):
  de API moet **Bring Your Own Functions (BYOF)** worden — een losstaande Azure Function
  App die als `/api`-backend aan de SWA wordt gekoppeld — en **niet** SWA *managed*
  functions. Reden: SWA managed functions ondersteunen **géén** managed identity en
  **géén** Key Vault references, en hebben een **~45s** time-out die botst met de **60s**
  Hupie-calls. BYOF lost beide op; de TBI-standaard sluit hierop aan (Standard-SKU voor de
  koppeling, Flex Consumption voor de 60s-calls).

---

## 1. TBI Azure Foundation — governance & archetype

Gezaghebbende standaard: **"FoundationDesign - TBI - Resource Organization v1.0"** (InSpark).
Deze standaard staat **niet** in deze repo; de onderstaande waarden zijn verbatim
overgenomen en zijn **leidend** waar dit document er eerder van afweek.

- **Tenant:** `tbiholding.onmicrosoft.com`. Dit is een **policy-afgedwongen Azure
  Landing Zone-fundament** (4-laags management-groups, subscription-vending, archetypes).
  **Verplichte tags en toegestane-waardelijsten worden door Azure Policy afgedwongen** —
  een ontbrekende verplichte tag of een out-of-list-waarde **blokkeert de deployment**.
- **Archetype voor deze app: `Online-Isolated`** — publiek-benaderbare app, **WAF
  toegestaan**, **geen connectivity-hub**. De app consumeert uitsluitend externe API's
  (Hupie / BAG / PDOK / EP-online / Open-Meteo) en **geen interne TBI-corp-resources**,
  dus dit archetype past exact.
- **Subscription-vending:** apps landen in een **gevende (vended) subscription** onder de
  archetype-management-group. **Bevestig vooraf dat de doel-subscription het
  `Online-Isolated`-archetype heeft** — anders lijnen de policies niet uit en kunnen
  deploys geblokkeerd worden. Dit is een randvoorwaarde (stap 1 van de cutover, §10).

### 1.1 Beveiliging in het archetype (kort)

De `api/*`-handlers zijn op Vercel **nu ongeauthenticeerd** (open proxies die de
server-side keys aanhangen). Bij de migratie:

- De server-side **write-allowlist + range-validatie** (RSEC-1) horen **in de Function
  App** te worden ingebouwd tijdens de port — de huidige #138-guard staat alleen
  client-side en is dus omzeilbaar.
- De **SWA built-in authenticatie** van het `Online-Isolated`-archetype + een optionele
  **Front Door / WAF** sluiten de open-read-proxy-blootstelling (RSEC-2).

Dit document is de **provisioning-spec**; de `api/*` → Azure Functions **port is een
aparte code-taak** (zie §7).

---

## 2. Architectuur-beslispunt (verplicht lezen)

De oorspronkelijke opdracht beschreef **SWA met geïntegreerde *managed* functions**,
waarbij de managed-functions-API secrets uit Key Vault leest via managed identity. Uit
verificatie tegen de actuele Microsoft-documentatie blijkt dat die combinatie **niet
bouwbaar is zoals letterlijk omschreven**. Twee onafhankelijke, geverifieerde beperkingen
wijzen allebei naar dezelfde oplossing.

### 2.1 Managed functions ⇏ managed identity / Key Vault

De officiële feature-matrix (`apis-functions`, bijgewerkt 2026-06-02):

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

→ Met **managed** functions kan de API **niet** via managed identity uit Key Vault lezen —
precies de kern van de besliste secret-architectuur.

### 2.2 De ~45s time-out botst met de 60s Hupie-calls

Managed functions draaien uitsluitend op het **Consumption**-plan en zitten achter een
SWA-gateway met een bekende **~45 seconden** responslimiet (het gedocumenteerde
"500 na 45s"-gedrag). De app hanteert een **60s** time-out op álle Hupie-calls:

- `src/services/hupieApi.ts:76` — list-client `timeout: 60000`
- `src/services/hupieApi.ts:89` — detail-client `timeout: 60000`
- `src/services/hupieApi.ts:105` — update-client `timeout: 60000`

→ Een trage Hupie-call (tot 60s) zou door managed functions op ~45s met een 500
afgekapt worden. BYOF (Flex Consumption / Premium) heeft deze gateway-limiet niet (wél de
Azure load-balancer idle-limiet van 230s, ruim boven 60s).

### 2.3 Besluit: Bring Your Own Functions (BYOF)

Beide punten worden opgelost door **één** verfijning, die Microsoft expliciet aanraadt:

> *"If you need managed identity or Key Vault references in your API, use the bring your
> own Functions app feature to use a separate Functions app that uses managed identity."*

**Aanpak:** een losstaande **Azure Function App** met een backing storage account,
gekoppeld aan de SWA via **Settings → APIs → Link** als de `/api`-backend. Vereist de SWA
**Standard-SKU**.

| Aspect | Managed functions (oorspronkelijke tekst) | **BYOF (aanbevolen, bouwbaar)** |
| --- | --- | --- |
| Managed identity → Key Vault | ✕ niet mogelijk | ✔ system-assigned identity + KV references |
| 60s Hupie-call | ✕ ~45s afkap | ✔ geen 45s-limiet (Flex Consumption) |
| Extra resources | geen | Function App + Storage account (+ hosting-plan) |
| Deploy | door SWA beheerd | eigen deploy-workflow voor de Function App |
| Koppelmechanisme | ingebouwd | `api_location: ""` + portal-**Link** |

> **Randvoorwaarden BYOF** (uit `functions-bring-your-own`): de gekoppelde Function App
> mag **geen IP-restricties** en **geen private link/service endpoints** hebben (SWA
> proxyt er publiek naartoe); moet de default **`/api`**-routeprefix in `host.json`
> behouden; er kan **één** Function App per SWA gekoppeld worden; koppelen zet
> `api_location` op `""` in de build-workflow. Het koppelen maakt automatisch een
> identity provider *"Azure Static Web Apps (Linked)"* aan zodat alleen de SWA de API mag
> aanroepen.

---

## 3. Overzicht & architectuur

De frontend is een Vite/React 18 SPA (MUI 5) die na `npm run build` statische assets
naar `dist/` schrijft. Client-side routing (react-router-dom) vereist een SPA-fallback
naar `/index.html`. Drie server-side proxies verbergen de upstream-API-keys voor de
browser; twee publieke API's (PDOK, Open-Meteo) worden direct vanuit de browser
aangeroepen (CORS-open, geen key).

```
                       ┌───────────────────────────────────────────────┐
   Browser (SPA)  ───► │  Azure Static Web Apps (Standard)              │
   React/Vite/MUI      │  stapp-tdi500-dashboard-p-weu-01               │
                       │  • statische assets uit dist/                  │
                       │  • navigationFallback → /index.html            │
                       └───────────────┬───────────────────────────────┘
                                       │  /api/*  (proxy naar linked backend)
                                       ▼
                       ┌───────────────────────────────────────────────┐
                       │  Azure Function App (BYOF, Flex Consumption)   │
   system-assigned ◄───┤  func-tdi500-dashboard-p-weu-<uniq>            │
   managed identity    │  • hupie / bag / ep-online (HTTP-triggers)     │
                       │  • leest secrets via Key Vault references      │
                       └───┬───────────────────────────┬───────────────┘
                           │ @Microsoft.KeyVault(...)   │  fetch()
                           ▼                            ▼
              ┌────────────────────────┐   ┌──────────────────────────────────┐
              │ Key Vault              │   │ Externe upstreams:                │
              │ kvtdi500p<uniq>        │   │ • Hupie SPARQL (HUPIE_API_URL)    │
              │ • hupie-api-key        │   │ • api.bag.kadaster.nl             │
              │ • bag-api-key          │   │ • public.ep-online.nl             │
              │ • ep-online-api-key    │   └──────────────────────────────────┘
              └────────────────────────┘
                                       ▲
   Browser (SPA) ──────────────────────┘  direct, publiek, géén key/proxy:
                                          • api.pdok.nl (Locatieserver)
                                          • api.open-meteo.com (weer)

   Telemetrie: SWA + Function App → Application Insights
               (appi-tdi500-dashboard-p-weu-01, workspace-based)
```

### Vercel → Azure mapping

| Vercel (huidig) | Azure (doel) |
| --- | --- |
| Statische hosting (`outputDirectory: dist`) | Static Web Apps (Standard) — statische app (`dist/`) |
| `api/*.ts` serverless functions | **Bring Your Own** Azure Function App, gekoppeld als `/api` |
| Env-secrets in Vercel-dashboard (`HUPIE_API_KEY`, `BAG_API_KEY`, `EP_ONLINE_API_KEY`) | Key Vault-secrets, via managed identity als KV-references |
| Publieke env (`VITE_*`) in Vercel-build | SWA build-configuratie (build-time env) |
| `vercel.json` rewrites (SPA-fallback + `/ep-online/*`) | `staticwebapp.config.json` (`navigationFallback` + `routes`) |
| `vercel.json` CORS-headers op `/api/*` | Niet nodig (same-origin via `/api`) / `staticwebapp.config.json` `globalHeaders` |

---

## 4. Resource-lijst

De tabel hieronder toont de **PRODUCTIE**-omgeving (`env=p`, `region=weu`). Een
**dev**-omgeving is een **aparte, gevende subscription** met **dezelfde namen** maar
`env=d` (bijv. `rg-tdi500-dashboard-d-weu-01`). `t` (Test) en `a` (Acceptance) volgen
hetzelfde patroon indien nodig.

| Resource | Naam (productie) | Notities |
| --- | --- | --- |
| Resource group | `rg-tdi500-dashboard-p-weu-01` | Container voor alle app-resources in deze subscription. |
| Static Web App (**Standard-SKU**) | `stapp-tdi500-dashboard-p-weu-01` | **Standard-SKU VEREIST** om een aparte Function App (BYOF) te koppelen; de hostname wordt automatisch gerandomiseerd. |
| Function App (de `api/*`-port) | `func-tdi500-dashboard-p-weu-<uniq>` | Globaal uniek → **unieke suffix** (`uniqueString(resourceGroup().id)`); **system-assigned managed identity AAN**. |
| Function hosting-plan | `asp-tdi500-dashboard-p-weu-01` | **Flex Consumption aanbevolen** (verwerkt de 60s Hupie-time-out; vermijdt de ~45s gateway-cap van SWA managed functions). |
| Storage account (Function-backing) | `sttdi500p<uniq>` | ≤ 24 tekens, **lowercase, GEEN koppeltekens**, globaal uniek; **region-segment weggelaten** om binnen 24 te passen. |
| Key Vault (secrets) | `kvtdi500p<uniq>` | ≤ 24 tekens, globaal uniek; region-segment weggelaten om te passen; bevat `HUPIE_API_KEY`, `HUPIE_API_URL`, `BAG_API_KEY`, `EP_ONLINE_API_KEY`. |
| Application Insights | `appi-tdi500-dashboard-p-weu-01` | **Workspace-based.** |
| Log Analytics workspace | `log-tdi500-dashboard-p-weu-01` | Óf richt App Insights op de **centrale platform-LAW** van de landingszone. |

> **Geen PostgreSQL / geen database** — de app is een read-through proxy en houdt geen
> state. Het enige storage account is de **technische backing-store** die een Azure
> Function App altijd nodig heeft, niet voor applicatiedata.
>
> **Geen aparte managed-identity-resource** — de Function App gebruikt een
> **system-assigned identity**, die de rol **`Key Vault Secrets User`** op de Key Vault
> krijgt; secrets worden als **Key Vault references** in de Function-App-settings gezet —
> **nooit als platte app-setting, nooit in de client-bundle**.

### 4.1 Naamgevingsconventie (TBI-standaard)

Structuur: **`[type]-[workload]-[app]-[env]-[region]-[num]`**

- `workload` = **`tdi500`** · `app` = **`dashboard`**
- `env` = **`d`** | **`t`** | **`a`** | **`p`** (Development / Test / Acceptance / Production)
- `region` = **`weu`** (West Europe) | **`neu`** (North Europe)
- `num` = **twee cijfers** (`01`), **óf** een unieke string (`uniqueString(resourceGroup().id)`)
  voor globaal-unieke resources.

CAF-type-afkortingen (geverifieerd tegen de standaard): `rg`, `stapp` (Static Web App),
`func` (Function App), `asp` (App Service / Consumption-plan), `st` (Storage), `kv`
(Key Vault), `appi` (Application Insights), `log` (Log Analytics workspace).

> Dit vervangt de eerdere **provisionele** conventie in dit document (die een screenshot
> spiegelde, bv. `stapp-tdi500-prod`). De TBI-Foundation-standaard is nu leidend.

### 4.2 Lengte-gelimiteerde & globaal-unieke namen

- **Storage account** (`st…`) en **Key Vault** (`kv…`): max **24 tekens**, en Storage
  staat **geen koppeltekens** toe. Daarom worden deze **lowercase** geschreven, **zonder
  hyphens**, en met het **region-segment weggelaten**: `sttdi500p<uniq>`,
  `kvtdi500p<uniq>`.
- **Globaal-unieke** resources (Storage, Key Vault, Function App als
  `*.azurewebsites.net`, SWA als `*.azurestaticapps.net`): gebruik de **`uniqueString`**
  in plaats van `num` zodat de naam gegarandeerd vrij is.
- Documenteer de uiteindelijk gekozen concrete namen (met de opgeloste `<uniq>`) na
  provisioning terug in dit bestand.

---

## 5. Tags (verplicht — door Azure Policy afgedwongen)

Op de **resource group EN elke resource**. **Azure Policy weigert de deployment** bij een
ontbrekende verplichte tag of een waarde buiten de toegestane lijst. Waarden met
`<FILL: …>` zijn placeholders die de provisioner **moet** invullen — niet verzinnen.

| Tag | Waarde |
| --- | --- |
| `WorkloadName` | `tdi500` *(voorstel)* |
| `ApplicationName` | `TDI 500 KPI Dashboard` *(voorstel)* |
| `Environment` | `Production` *(toegestaan: Production / Acceptance / Test / Development)* |
| `Owner` | `<FILL: eigenaar — e-mail/DL>` |
| `CostCenter` | `<FILL: een van de goedgekeurde 3-letter-codes — anders faalt de deploy>` |
| `ManagedBy` | `<FILL: bijv. SSC-ICT>` |
| `DataClassification` | `<FILL: bijv. Confidential/Internal — verwerkt adres- + telemetriedata>` |
| `ApplicationNumber` | `<FILL: 4-cijferige cost-management-code, op RG-niveau>` |

> **Geen `Supplier_`-tagprefix.** Die prefix is uitsluitend voor externe partijen (zoals
> InSpark/KPN); TBI/SSC die deze resources zelf aanmaakt gebruikt **platte tags** zoals
> hierboven.

---

## 6. Environment variables & secrets

Volledige inventaris van elke env-var die de app leest, build-time én runtime,
geclassificeerd. **In dit document staan uitsluitend namen — nooit secret-waarden.**

### 6.1 Server-side secrets → Key Vault

Uitgelezen door de Function App (na migratie hetzelfde `process.env`-leespatroon; alleen
de bron van de waarde wordt een Key Vault reference). Key Vault = `kvtdi500p<uniq>`
(productie; dev = `kvtdi500d<uniq>`).

| Env-var (app-setting) | Gelezen op | Voorgestelde KV-secretnaam | App-setting-waarde (KV reference) |
| --- | --- | --- | --- |
| `HUPIE_API_KEY` | `api/hupie.ts:39` | `hupie-api-key` | `@Microsoft.KeyVault(SecretUri=https://kvtdi500p<uniq>.vault.azure.net/secrets/hupie-api-key/)` |
| `BAG_API_KEY` | `api/bag.ts:21` | `bag-api-key` | `@Microsoft.KeyVault(SecretUri=https://kvtdi500p<uniq>.vault.azure.net/secrets/bag-api-key/)` |
| `EP_ONLINE_API_KEY` | `api/ep-online.ts:7` | `ep-online-api-key` | `@Microsoft.KeyVault(SecretUri=https://kvtdi500p<uniq>.vault.azure.net/secrets/ep-online-api-key/)` |
| `HUPIE_API_URL` | `api/hupie.ts:40` | *(geen credential — zie noot)* | Platte app-setting **óf** KV-secret `hupie-api-url` |

> **`HUPIE_API_URL`** is een **endpoint-URL, geen credential**. Het mag een platte
> Function-App-app-setting zijn. Het co-lokaliseren in Key Vault (`hupie-api-url`) houdt
> alle Hupie-config op één plek — keuze aan SSC-ICT. De proxy verwacht de **`/query/`**
> -variant en wisselt intern naar `/update/` voor SPARQL UPDATE (`api/hupie.ts:53-55`).

**Managed-identity-toegang.** Zet op de Function App een **system-assigned managed
identity** aan en geef die identity leesrechten op de Key Vault:

- **RBAC (aanbevolen):** rol **`Key Vault Secrets User`** op de identity, scope = de Key
  Vault (vereist dat de Key Vault op het RBAC-autorisatiemodel staat).
- **Access policy:** *Get* op *Secrets* voor de identity (bij het legacy
  access-policy-model).

Key Vault reference-syntax (beide vormen toegestaan):

```text
@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/<secret>/)
@Microsoft.KeyVault(VaultName=<vault>;SecretName=<secret>)
```

### 6.2 Publieke build-time env (VITE_*) → SWA build-configuratie

VITE_-prefixed en dus **in de client-bundle gebakken** — geen secrets. Horen in de
SWA-buildconfiguratie (build-time environment), **niet** in Key Vault.

| Env-var | Gelezen op | Doel |
| --- | --- | --- |
| `VITE_API_TIMEOUT` | `src/config/index.ts:6` | Time-out (ms) voor de list-query; default 30000. |
| `VITE_USE_MOCK_DATA` | `src/services/hupieApi.ts:41`, `src/services/mockData.ts:10` | Default databron. `.env.production:1` zet `false` (prod draait live). |

> **`VITE_ENABLE_MOCK_TOGGLE`** staat in `.env.production:2` (`=true`) maar wordt door
> **geen enkele** broncode gelezen (geverifieerd: komt alleen in `.env.production` voor).
> Het is dead config / een no-op. **Niet provisionen** tenzij eerst een consumer in de
> code wordt toegevoegd.

### 6.3 Dev-only (lokale Vite-proxy) → NIET in Azure zetten

Deze VITE_-secrets bestaan uitsluitend voor de lokale dev-proxy in `vite.config.ts`. In
productie worden dezelfde upstreams server-side geproxyd via `api/*.ts` met de
niet-VITE_ keys hierboven. **Nooit in enige Azure-scope zetten** — het zijn VITE_-vars die
in de bundle zouden lekken (dit is de kern van de #138-fix).

| Env-var | Gelezen op | Status |
| --- | --- | --- |
| `VITE_EP_ONLINE_API_KEY` | `vite.config.ts:24` | Alleen lokale dev-proxy. Prod gebruikt `api/ep-online.ts` + `EP_ONLINE_API_KEY`. **Niet provisionen.** |
| `VITE_KNMI_API_KEY` | `vite.config.ts:32`, `src/utils/envCheck.ts:11` | **Vestigiaal.** Geen code roept KNMI aan; het weer komt van Open-Meteo (`src/services/weatherService.ts:13`). `envCheck` logt enkel een optionele-feature-debugregel. **Niet provisionen.** |

> **Cross-check met #138 & `.env.example`.** `src/utils/envCheck.ts:7-11` gebruikt
> *statische* `import.meta.env.VITE_KNMI_API_KEY`-toegang — de #138-fix die voorkomt dat
> Vite het hele env-object (en dus elk VITE_-secret) inlijnt. `.env.example` (regels 5-9)
> documenteert al: *"VITE_ secrets here are for the LOCAL DEV PROXY ONLY — never set them
> in any Vercel scope."* **Neem diezelfde waarschuwing mee naar Azure.**

### 6.4 Rotatie bij cutover

- **`HUPIE_API_KEY`** — er staat al een sleutelrotatie met Klaas Andries open. Voer de
  **nieuwe** sleutel **direct in Key Vault** (`hupie-api-key`) in bij cutover — **in één
  beweging** (roteren = in KV zetten, niet twee keer). De Function App pikt hem op via de
  reference zonder redeploy.
- **`BAG_API_KEY` / `EP_ONLINE_API_KEY`** — bij voorkeur vers aanmaken in Key Vault bij
  cutover in plaats van uit Vercel te kopiëren, zodat de oude Vercel-scope daarna
  ingetrokken kan worden.

---

## 7. API-port checklist (Vercel → Azure Functions)

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

- [ ] **Server-side write-hardening (RSEC-1):** bouw in de Function App een **allowlist**
  in die alleen de twee bekende SPARQL-UPDATE-vormen accepteert + **range-validatie
  server-side** (setpoint 10–30, base 20–60, slope −4.0…−0.1). De huidige guard staat
  alleen client-side en is omzeilbaar.
- [ ] **Types/handtekening:** `@vercel/node` `VercelRequest`/`VercelResponse` →
  Azure Functions v4 `HttpRequest`/`HttpResponseInit`; default-export handler →
  `app.http('hupie', { methods, authLevel, handler })`.
- [ ] **Raw body (Hupie):** `export const config = { api: { bodyParser: false } }`
  (`api/hupie.ts:21`) en het stream-lezen (`api/hupie.ts:29`) → Azure `await request.text()`
  voor de ruwe SPARQL-body (Content-Type `application/sparql-query` of `application/sparql-update`).
- [ ] **Query/URL-parsing:** `req.query['subpath']` (`api/ep-online.ts:15`) en het handmatig
  splitsen van `req.url` (`api/bag.ts:31-32`, `api/ep-online.ts:23-24`) →
  `request.query.get('subpath')` / `new URL(request.url)`.
- [ ] **Response:** `res.status().send()/.json()/.setHeader()` → return een
  `HttpResponseInit { status, headers, body }`. Behoud het **verbatim doorsturen** van
  upstream-status + body (`api/hupie.ts:71-75`), inclusief de 200-met-foutbody die
  `RateLimitError`/`ManufacturerServerError` aandrijft (`src/services/hupieApi.ts:264-275`).
- [ ] **Secrets:** `process.env['HUPIE_API_KEY']` e.d. blijven `process.env`-reads; alleen
  de bron wordt een Key Vault reference-app-setting (§6.1).
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

## 8. Outbound dependencies (netwerk/firewall)

Voor wie provisioned/netwerk inricht — informatief, niets configureren.

| Upstream | Host | Via | Auth | Notities |
| --- | --- | --- | --- | --- |
| Hupie SPARQL | `HUPIE_API_URL` (Azure-gehost, per opdracht) | Function App (`api/hupie.ts`) | `?token=` query-param | 60s time-out; retourneert 200-met-foutbody bij rate-limit. |
| BAG Individuele Bevragingen | `api.bag.kadaster.nl` | Function App (`api/bag.ts`) | header `X-Api-Key` | `Accept-Crs: epsg:28992`, `Accept: application/hal+json`. |
| EP-online | `public.ep-online.nl` | Function App (`api/ep-online.ts`) | header `Authorization` (rauwe key) | `User-Agent: TDI500-Dashboard/1.0` verplicht. |
| PDOK Locatieserver | `api.pdok.nl` | **direct uit browser** | geen (publiek) | `src/services/bagService.ts:56`; CORS-open, geen proxy/key. |
| Open-Meteo | `api.open-meteo.com` | **direct uit browser** | geen (publiek) | `src/services/weatherService.ts:13`; CORS-open, geen key. |
| ~~KNMI Data Platform~~ | `api.dataplatform.knmi.nl` | alleen dev-proxy | — | **Vestigiaal — niet in productie gebruikt.** Zie §6.3. |
| Google Fonts | `fonts.googleapis.com` / `fonts.gstatic.com` | direct uit browser | geen | `index.html:7-9` (Inter font). |

> **IP-allowlisting (vraag voor de provisioner):** als Hupie/Triple Solar IP-allowlisting
> afdwingt, moeten de **uitgaande IP's van de Function App** (of een NAT-gateway) bij hen
> geregistreerd worden. BYOF op Flex Consumption/Premium heeft voorspelbare outbound-IP's
> of kan VNet-integratie gebruiken. **Let op de tegengestelde eis:** de Function App zelf
> mag géén *inbound* IP-restricties of private link hebben (SWA-koppeling vereist publieke
> bereikbaarheid — §2.3). Dit past binnen het `Online-Isolated`-archetype (publiek,
> WAF-afgeschermd, geen connectivity-hub).

---

## 9. Observability & config

- **Logging vandaag:** overal `console.*` (server-side in `api/hupie.ts`, `api/bag.ts`,
  `api/ep-online.ts`; client-side o.a. `src/services/bagService.ts`,
  `src/services/hupieApi.ts:128`, `src/services/weatherService.ts:109`). Geen structured
  telemetry, geen App Insights SDK aanwezig.
- **App Insights aansluiten:** zet **Application Insights aan op de SWA** (dekt de
  statische app) én **op de Function App** (dekt de API; `console.*` in de functions
  stroomt dan automatisch naar App Insights). App-setting
  `APPLICATIONINSIGHTS_CONNECTION_STRING` op de Function App (mag KV-referenced, maar de
  connection string is geen hard secret). Gebruik `appi-tdi500-dashboard-p-weu-01` of de
  centrale platform-LAW.
- **Time-out/limieten:** de 60s Hupie-time-out (`src/services/hupieApi.ts:76,89,105`) is
  de reden dat BYOF nodig is (§2.2). Onder BYOF geldt de Azure load-balancer idle-limiet
  van **230s** — ruim boven 60s. Zorg dat het gekozen Function-App-plan een
  functie-time-out ≥ 60s toestaat (Flex Consumption/Premium: prima).

---

## 10. Cutover — geordende checklist

**Alle stappen zijn HUMAN/SSC-ICT-acties.** Dit document provisioned niets. Per env
(begin met een niet-productie-env als die er is, daarna `p`).

1. [ ] **Bevestig de doel-subscription** = een `Online-Isolated`, **gevende (vended)
       landingszone-subscription** (§1). *(Randvoorwaarde — anders lijnen de policies niet
       uit en kan de deploy geblokkeerd worden.)*
2. [ ] **Resource group** aanmaken (`rg-tdi500-dashboard-p-weu-01`) **met de verplichte
       tags uit §5** (policy weigert anders).
3. [ ] **Key Vault** aanmaken (`kvtdi500p<uniq>`, RBAC-model aanbevolen).
4. [ ] **Secrets opslaan** in de Key Vault: de **(geroteerde)** Hupie-sleutel (§6.4),
       `bag-api-key`, `ep-online-api-key` (en optioneel `hupie-api-url`).
5. [ ] **Log Analytics** (`log-tdi500-dashboard-p-weu-01`) + **Application Insights**
       (`appi-tdi500-dashboard-p-weu-01`, workspace-based) aanmaken.
6. [ ] **Storage account** (`sttdi500p<uniq>`) aanmaken (backing-store voor de Function App).
7. [ ] **Function App** (`func-tdi500-dashboard-p-weu-<uniq>`, Flex Consumption, Node.js
       LTS) aanmaken **met system-assigned identity AAN**, en die identity de rol
       **`Key Vault Secrets User`** op de Key Vault geven.
8. [ ] **Secrets wiren** als **Key Vault references** in de Function-App-settings (§6.1).
       **Geen** IP-restricties/private link op de Function App.
9. [ ] **Static Web App** (`stapp-tdi500-dashboard-p-weu-01`, **Standard**) aanmaken en de
       **Function App als backend koppelen** (Settings → APIs → Link; `api_location: ""`).
10. [ ] **SWA build-config** zetten: publieke build-time env (§6.2) —
        `VITE_API_TIMEOUT`, `VITE_USE_MOCK_DATA`. **Geen** VITE_-secrets (§6.3).
11. [ ] **Deployen** (SPA-artefact `dist/`; API-port naar de Function App — aparte code-PR,
        §7; default `/api`-prefix in `host.json` behouden).
12. [ ] **Verifiëren:** SPA laadt en routeert (deep-link refresh werkt); `/api/hupie`,
        `/api/bag`, `/ep-online/*` geven live data; secrets zitten **niet** in de
        client-bundle (grep de gepubliceerde `dist/` op key-namen); App Insights ontvangt
        traces; een trage Hupie-call > 45s wordt niet afgekapt.
13. [ ] **Vercel afbouwen:** na groen op productie de oude Vercel-deployment + env-scopes
        intrekken en de stale alias `tdi500-kpi-dashboard.vercel.app` verwijderen.

---

## 11. Repo-observaties die provisioning raken

- **Node-versie is nergens gepind:** geen `engines` in `package.json`, geen `.nvmrc`,
  geen CI-workflow (alleen `.github/dependabot.yml`). `@vercel/node@^5.8.22` impliceert
  Node 20/22-klasse. **Aanbeveling:** pin Node 20 LTS voor zowel de SWA-build als de
  Function-App-runtime, en voeg `engines.node` toe (aparte kleine PR).
- **Build:** `npm run build` = `tsc && vite build` (`package.json:8`) → `dist/`
  (`vercel.json:4`). `type: module` (ESM).
- **Prod-defaults in de bundle:** `.env.production` bakt `VITE_USE_MOCK_DATA=false` in
  (prod draait live) en `VITE_ENABLE_MOCK_TOGGLE=true` (ongebruikt — §6.2).

---

## 12. Bronnen

- **"FoundationDesign - TBI - Resource Organization v1.0"** (InSpark; tenant
  `tbiholding.onmicrosoft.com`) — **gezaghebbend** voor naamgeving, verplichte
  policy-tags, het `Online-Isolated`-archetype en subscription-vending. Buiten deze repo
  aangeleverd; niet in de repo aanwezig.

Platformfeiten geverifieerd tegen de actuele Microsoft Learn-documentatie (juli 2026):

- [API support in Azure Static Web Apps with Azure Functions](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-functions) — feature-matrix: managed functions ✕ managed identity / ✕ Key Vault references / Consumption-only / HTTP-only.
- [Secure authentication secrets in Azure Key Vault for Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/key-vault-secrets) — "Key Vault integration is not available for … Static web apps using managed functions"; managed identity vereist Standard-plan; KV alleen in productie.
- [Bring your own functions to Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own) — Standard-plan vereist; koppelmechanisme; `api_location: ""`; geen IP-restricties/private link; één Function App per SWA; HTTP-only.
- [Use Key Vault references as app settings (App Service/Functions)](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references) — `@Microsoft.KeyVault(...)`-syntax.
- [Static Web Apps hosting plans](https://learn.microsoft.com/en-us/azure/static-web-apps/plans) — Standard vs Free feature-verschillen.
- [Azure resource naming — CAF abbreviations](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations) — `stapp`, `func`, `kv`, `appi`, `asp`, `log`, `st`, `rg`.
- SWA managed-functions ~45s gateway-time-out: [Azure/static-web-apps issue #801](https://github.com/Azure/static-web-apps/issues/801) en meerdere Microsoft Q&A-meldingen ("500 na 45s").
