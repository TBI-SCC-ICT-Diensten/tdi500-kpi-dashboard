# Examen Verslag

TDI 500 — Contingency KPI Dashboard

Activity 3.4 — Proof of Concept

| **Kandidaat**          | Destiny Tiyjudy                    |
|------------------------|------------------------------------|
| **Studentnummer**      | 9015646                            |
| **Klas**               | PALVSOD3B                          |
| **Examencode**         | SD_SD20_PvB1_B1-K1-2_3v1           |
| **BPV Bedrijf**        | TBI SSC ICT                        |
| **Praktijkbegeleider** | Jeroen Pat                         |
| **Sprint**             | 16 maart – 27 maart 2026           |
| **GitHub**             | Marvel-School/tdi500-kpi-dashboard |

# 1. Planning & Ontwerp (B1-K1-W1 / W2)

## 1.1 Eisen, wensen en technische uitgangspunten

*[Beschrijf hier de functionele eisen vanuit het TDI 500 projectplan (Werkpakket 3.4). Wat moet het dashboard kunnen? Welke data moet het tonen? Wat zijn de technische randvoorwaarden (browser support, API beschikbaarheid, ontologie-standaarden)?]*

## 1.2 User stories met acceptatiecriteria

*[Lijst van alle user stories met hun acceptatiecriteria. Verwijs naar de GitHub Issues (#1–#11) of kopieer ze hier.]*

## 1.3 Definition of Done

*[Kopieer hier de Definition of Done zoals vastgesteld op het GitHub Projects scrumboard.]*

## 1.4 Sprint backlog (begin sprint)

Screenshot van het scrumboard aan het begin van de sprint, met user stories geprioriteerd (hoogste bovenaan):

*[Screenshot: Sprint backlog begin sprint — scrumboard_dag_1.png]*

## 1.5 Scrumboard screenshots (dagelijks)

Na elke dagelijkse update wordt een screenshot van het scrumboard gemaakt:

*[Screenshot: Dag 1 — Ma 16 mrt]*

*[Screenshot: Dag 2 — Di 17 mrt]*

*[Screenshot: Dag 3 — Wo 18 mrt]*

*[Screenshot: Dag 4 — Do 19 mrt]*

*[Screenshot: Dag 5 — Vr 20 mrt]*

*[Screenshot: Dag 6 — Ma 23 mrt]*

*[Screenshot: Dag 7 — Di 24 mrt]*

*[Screenshot: Dag 8 — Wo 25 mrt]*

*[Screenshot: Dag 9 — Do 26 mrt]*

*[Screenshot: Dag 10 — Vr 27 mrt]*

## 1.6 Wireframes

Wireframes voor alle pagina’s (desktop en mobiel/tablet):

*[Plak hier de wireframes voor /, /contingent/:id, en /about — desktop en mobiel versies.]*

*[Screenshot: Wireframe: Dashboard (/) — Desktop]*

*[Screenshot: Wireframe: Dashboard (/) — Mobiel]*

*[Screenshot: Wireframe: Contingent Detail (/contingent/:id) — Desktop]*

*[Screenshot: Wireframe: Contingent Detail (/contingent/:id) — Mobiel]*

*[Screenshot: Wireframe: About (/about) — Desktop]*

*[Screenshot: Wireframe: About (/about) — Mobiel]*

## 1.7 Sitemap / Routing structure

*[Plak hier de sitemap die de routing structuur toont: / → Dashboard, /contingent/:id → Detail, /about → Info]*

*[Screenshot: Sitemap diagram]*

## 1.8 Componentendiagram

React component tree met architectuur: Router, ErrorBoundary, ThemeProvider, DashboardProvider, useDashboardData hook, services, config.

*[Screenshot: Componentendiagram]*

## 1.9 UML Class Diagram (TypeScript Interfaces)

Diagram met alle TypeScript interfaces en hun onderlinge relaties. Toont hoe SPARQL/HCO/SAREF data mapt naar de frontend models.

*[Screenshot: UML Class Diagram]*

## 1.10 Dataflow-diagram

Volledige dataflow: User selecteert contingent → React → Axios → Hupie API → JSON → dataMapper → kpiAggregator → decisionEngine → useDashboardData → UI.

*[Screenshot: Dataflow / Sequence diagram]*

## 1.11 Onderbouwing technologiekeuzes

*Bron: [docs/Onderbouwing_Technologiekeuzes_TDI500.docx](Onderbouwing_Technologiekeuzes_TDI500.docx). Inhoud opgesteld 13 maart 2026 voor sprintstart, met één post-sprint correctie (`/about` → `/bag-lookup`).*

Hieronder worden de technologiekeuzes voor het TDI 500 KPI Dashboard onderbouwd. Per keuze wordt beschreven waarom de technologie is gekozen, welke alternatieven zijn overwogen, en waarom die alternatieven niet zijn gekozen.

#### 1. Frontend Framework: React 18 met TypeScript

##### Waarom React 18?

React is gekozen als frontend framework vanwege de component-based architectuur. Het dashboard bestaat uit meerdere onafhankelijke onderdelen (contingentselectie, KPI-kaarten, grafieken, beslissingsadvies) die elk als herbruikbaar component kunnen worden gebouwd en los van elkaar kunnen worden ontwikkeld en getest.

React heeft een groot ecosysteem met uitgebreide ondersteuning voor de bibliotheken die nodig zijn in dit project (Material UI, ApexCharts, React Router). Daarnaast bieden React Hooks (useState, useMemo, useContext) een overzichtelijke manier om state management en afgeleide data te beheren zonder externe state-bibliotheken.

##### Waarom TypeScript (strict mode)?

TypeScript is essentieel voor dit project omdat de data afkomstig is van een externe SPARQL API met een complexe ontologiestructuur (HCO/SAREF). Zonder TypeScript zou het makkelijk zijn om fouten te maken bij het mappen van ruwe API-data naar bruikbare frontend-objecten. Met TypeScript worden alle interfaces (Measurement, Contingent, KeyPerformanceIndicator, etc.) expliciet gedefinieerd, waardoor fouten bij het compileren al worden ontdekt in plaats van pas in de browser.

Strict mode is ingeschakeld om het gebruik van het type “any” te voorkomen, wat de betrouwbaarheid van de ontologie-mapping vergroot.

##### Overwogen alternatieven

|  |  |  |
|----|----|----|
| **Technologie** | **Voordelen** | **Nadelen / Reden niet gekozen** |
| **React 18 + TypeScript (gekozen)** | Component-based, groot ecosysteem, Hooks voor state, TypeScript voor type safety bij ontologie-mapping | — |
| Vue.js 3 + TypeScript | Lichtgewicht, goede documentatie, Composition API vergelijkbaar met Hooks | Kleiner ecosysteem voor data-dashboards. Minder libraries specifiek voor KPI-visualisatie. TypeScript-integratie is verbeterd maar historisch minder volwassen dan bij React. |
| Angular | Volledig framework met ingebouwde routing, forms, HTTP client. TypeScript standaard. | Te zwaar voor een Proof of Concept. Langere opstarttijd, steile leercurve. Overkill voor een dashboard dat primair data visualiseert. |
| Vanilla JavaScript | Geen framework overhead, maximale controle | Geen componentstructuur, geen state management, geen type safety. Zou leiden tot ongestructureerde code die moeilijk te onderhouden en te testen is. Niet geschikt voor een applicatie met meerdere interactieve views. |

#### 2. UI Component Library: Material UI (MUI v5)

##### Waarom MUI?

Material UI is gekozen omdat het een uitgebreide set van kant-en-klare, professionele UI-componenten biedt die direct bruikbaar zijn voor een dashboard: Cards voor KPI-overzichten, Grid voor responsive layouts, AppBar en Drawer voor navigatie, en Tables voor data-weergave.

MUI biedt een theming-systeem waarmee een custom kleurenpalet en typografie centraal worden gedefinieerd. Dit zorgt ervoor dat het hele dashboard er consistent uitziet zonder dat kleuren en stijlen verspreid door de code worden gedefinieerd.

Daarnaast heeft MUI ingebouwde ondersteuning voor responsive design via Grid breakpoints (xs, sm, md, lg), wat het eenvoudig maakt om het dashboard bruikbaar te maken op zowel desktop als tablet.

##### Overwogen alternatieven

|  |  |  |
|----|----|----|
| **Technologie** | **Voordelen** | **Nadelen / Reden niet gekozen** |
| **Material UI v5 (gekozen)** | Groot componentenaanbod, theming-systeem, responsive Grid, goede TypeScript support, veel documentatie | — |
| Chakra UI | Schone API, goede toegankelijkheid, eenvoudig te customizen | Kleiner ecosysteem, minder complexe componenten beschikbaar (bijv. geen ingebouwde DataGrid). Minder verspreid in de industrie, waardoor er minder voorbeelden en community-support beschikbaar zijn voor dashboard-specifieke patronen. |
| Ant Design | Uitgebreid componentenaanbod, sterk in tabellen en formulieren | Stijl is sterk gericht op Chinese markt, moeilijker te customizen naar een Europees/Nederlands uiterlijk. Grotere bundle size. TypeScript support is goed maar de documentatie is soms lastig te navigeren. |
| Tailwind CSS | Utility-first, maximale flexibiliteit, kleine bundle | Geen kant-en-klare componenten. Elk UI-element moet zelf worden opgebouwd, wat voor een PoC met beperkte tijd te veel werk is. Vereist meer CSS-kennis voor een professioneel resultaat. |

#### 3. Datavisualisatie: ApexCharts (react-apexcharts)

##### Waarom ApexCharts?

ApexCharts is gekozen vanwege de combinatie van interactiviteit en eenvoud. Het dashboard moet KPI-data visualiseren in verschillende chart-types (lijngrafieken voor temperatuurtrends, staafdiagrammen voor energieverbruik, meters voor COP-scores), en ApexCharts ondersteunt al deze types met een uniforme API.

ApexCharts biedt ingebouwde interactiviteit: tooltips bij hover, zoom op tijdreeksen, en exportfunctionaliteit. De react-apexcharts wrapper integreert direct met React’s component-model, waardoor charts automatisch re-renderen wanneer de data verandert (bijvoorbeeld bij het wisselen van contingent).

Daarnaast biedt ApexCharts een responsive configuratie waarmee charts zich automatisch aanpassen aan verschillende schermformaten, wat belangrijk is voor de tablet-ondersteuning.

##### Overwogen alternatieven

|  |  |  |
|----|----|----|
| **Technologie** | **Voordelen** | **Nadelen / Reden niet gekozen** |
| **ApexCharts (gekozen)** | Meerdere chart-types, interactief (tooltips, zoom), responsive, React wrapper beschikbaar, eenvoudige API | — |
| Recharts | React-native, declaratieve API, populair in React-projecten | Minder chart-types beschikbaar (geen gauge/radial chart standaard). Minder interactiviteit out-of-the-box. Voor het COP-gauge component zou een apart library nodig zijn. |
| Chart.js (react-chartjs-2) | Lichtgewicht, breed ondersteund, veel voorbeelden | Minder interactief dan ApexCharts. Gauge charts vereisen plugins. De React-wrapper is minder volwassen dan react-apexcharts. |
| D3.js | Maximale flexibiliteit, kan elke visualisatie bouwen | Te laagdrempelig voor een PoC. D3 vereist handmatige DOM-manipulatie, wat conflicteert met React’s virtual DOM. De leercurve is steil en de ontwikkeltijd voor standaard charts is veel hoger dan bij ApexCharts. |

#### 4. HTTP Client: Axios

##### Waarom Axios?

Axios is gekozen als HTTP client voor de communicatie met de Hupie SPARQL API. Axios biedt voordelen ten opzichte van de ingebouwde fetch API: automatische JSON-parsing, een ingebouwde timeout-configuratie, interceptors voor foutafhandeling, en een overzichtelijke API voor het instellen van headers (nodig voor API-authenticatie).

Voor dit project is de timeout-configuratie bijzonder relevant: de SPARQL-queries naar de Hupie API kunnen complex zijn, en een configureerbare timeout (via de centralized config module) voorkomt dat de applicatie onbeperkt blijft wachten op een response.

##### Overwogen alternatieven

|  |  |  |
|----|----|----|
| **Technologie** | **Voordelen** | **Nadelen / Reden niet gekozen** |
| **Axios (gekozen)** | Automatische JSON-parsing, timeout-configuratie, interceptors voor error handling, overzichtelijke API | — |
| Fetch API (ingebouwd) | Geen extra dependency, standaard in alle browsers | Geen ingebouwde timeout (moet handmatig met AbortController). Geen automatische JSON-parsing (vereist response.json() aanroep). Error handling is minder intuïtief: fetch reject alleen bij netwerk-fouten, niet bij HTTP 4xx/5xx responses. Voor een project met meerdere API-aanroepen en foutscenario’s leidt dit tot meer boilerplate code. |

#### 5. Testing Framework: Vitest

##### Waarom Vitest?

Vitest is gekozen voor de geautomatiseerde unit tests van de data- en logica-laag (dataMapper, kpiAggregator, decisionEngine). Vitest is compatibel met de Vite-bundler die in veel React-projecten wordt gebruikt, en biedt een snelle test-uitvoering dankzij native ES-module support.

De test-syntax is vrijwel identiek aan Jest (describe, it, expect), waardoor bestaande kennis direct toepasbaar is. Het verschil is dat Vitest sneller opstart en beter integreert met moderne TypeScript-projecten zonder extra configuratie.

##### Overwogen alternatieven

|  |  |  |
|----|----|----|
| **Technologie** | **Voordelen** | **Nadelen / Reden niet gekozen** |
| **Vitest (gekozen)** | Snelle opstarttijd, native TypeScript/ESM support, Jest-compatibele syntax, geen extra configuratie nodig | — |
| Jest | Industrie-standaard, veel documentatie, breed ondersteund | Langzamere opstarttijd, vereist extra configuratie voor TypeScript en ESM-modules (ts-jest of @swc/jest). Voor een project met een beperkt aantal unit tests weegt het voordeel van Jest’s grotere ecosysteem niet op tegen de snelheid en eenvoud van Vitest. |

#### 6. Routing: React Router v6

##### Waarom React Router?

React Router is gekozen om de applicatie op te delen in meerdere navigeerbare pagina’s: een hoofddashboard (`/`), een detailpagina per contingent (`/contingent/:id`), en een BAG-opzoekpagina voor installateurs (`/bag-lookup`). De `/about` route die oorspronkelijk gepland was, is tijdens de sprint geschrapt omdat een dashboardapplicatie geen aparte informatiepagina nodig had. Dit biedt een betere gebruikerservaring dan alles op één pagina plaatsen, en maakt het mogelijk om direct naar een specifiek contingent te linken via de URL.

React Router v6 is de standaard routing-oplossing voor React-applicaties. Het is lichtgewicht, integreert naadloos met React’s component-model, en biedt dynamische route-parameters (/:id) die nodig zijn voor de contingent-detailpagina.

Er zijn geen serieuze alternatieven overwogen omdat React Router de de facto standaard is voor client-side routing in React. Alternatieven zoals TanStack Router bestaan maar zijn minder verspreid en zouden voor een PoC geen meerwaarde bieden.

#### Samenvatting

Alle technologiekeuzes zijn gemaakt op basis van drie criteria: geschiktheid voor het type applicatie (data-dashboard met externe API), ontwikkelsnelheid (PoC met beperkte tijd), en betrouwbaarheid (type safety, error handling, geautomatiseerd testen). Bij elke keuze is minimaal één alternatief overwogen en is de afweging beschreven.

|  |  |  |
|----|----|----|
| **Categorie** | **Gekozen** | **Overwogen alternatieven** |
| Frontend Framework | **React 18 + TypeScript** | Vue.js 3, Angular, Vanilla JS |
| UI Library | **Material UI v5** | Chakra UI, Ant Design, Tailwind |
| Datavisualisatie | **ApexCharts** | Recharts, Chart.js, D3 |
| HTTP Client | **Axios** | Fetch API |
| Testing | **Vitest** | Jest |
| Routing | **React Router v6** | (de facto standaard) |

## 1.12 Onderbouwing ethiek, privacy en security

*Bron: [docs/Onderbouwing_Ethiek_Privacy_Security_TDI500.docx](Onderbouwing_Ethiek_Privacy_Security_TDI500.docx). Inhoud opgesteld 13 maart 2026 voor sprintstart.*

Dit document beschrijft hoe het TDI 500 KPI Dashboard omgaat met ethische verantwoordelijkheid, privacybescherming en informatiebeveiliging. Per onderwerp worden de risico’s, de genomen maatregelen en de onderbouwing van de keuzes beschreven.

#### 1. Privacy

##### 1.1 Context en risico’s

Het TDI 500 KPI Dashboard haalt data op via de Hupie SPARQL API. Deze data bevat meetgegevens van warmtepompen die geïnstalleerd zijn in woningen. In theorie zou deze data herleidbaar kunnen zijn tot specifieke huishoudens als er een koppeling wordt gemaakt tussen een warmtepompsysteem, een adres en een bewoner.

De risico’s zijn:

• Herleidbaarheid: als individuele warmtepompsystemen gekoppeld worden aan specifieke adressen, zou het mogelijk zijn om het energieverbruik van een specifiek huishouden te achterhalen.

• Profilering: langdurige meetdata (temperaturen, energieverbruik, storingen) kan patronen onthullen over bewonersgedrag, zoals aanwezigheid of afwezigheid.

• Datalekken: als API-credentials uitlekken, zou een onbevoegde partij toegang kunnen krijgen tot de volledige dataset.

##### 1.2 Genomen maatregelen

**Aggregatie op contingentniveau**

Het dashboard toont geen data op het niveau van individuele woningen of huishoudens. Alle KPI’s worden geaggregeerd op contingentniveau: groepen van vergelijkbare woningtypen. De gebruiker ziet gemiddelden, totalen en percentages over een groep warmtepompen, niet over een individueel systeem. Dit is een bewuste ontwerpkeuze die privacy by design implementeert.

**Geen persoonlijke gegevens**

Het dashboard verwerkt geen namen, adressen, telefoonnummers of andere persoonsgegevens. BAG-referenties (Basisregistratie Adressen en Gebouwen) worden alleen op contingentniveau gebruikt om groepen woningen te identificeren, niet om individuele adressen weer te geven.

**Geen opslag van data in de frontend**

Het dashboard slaat geen data lokaal op (geen localStorage, geen cookies, geen lokale database). Alle data wordt opgehaald van de Hupie API bij elk bezoek en alleen in het werkgeheugen van de browser bewaard. Zodra de gebruiker de pagina sluit, is de data verdwenen.

**Minimale data-opvraging**

De SPARQL-queries zijn zo geschreven dat alleen de data wordt opgehaald die nodig is voor de KPI-berekeningen. Er worden geen overbodige velden of datasets binnengehaald.

##### 1.3 AVG-overwegingen

Op basis van de huidige opzet verwerkt het dashboard geen persoonsgegevens in de zin van de AVG (Algemene Verordening Gegevensbescherming), omdat alle data geanonimiseerd en geaggregeerd is. Mocht in een toekomstige versie de data wel herleidbaar worden tot individuen (bijvoorbeeld bij het toevoegen van adres-level detail), dan zou een Data Protection Impact Assessment (DPIA) nodig zijn en zouden aanvullende maatregelen getroffen moeten worden.

#### 2. Security (Informatiebeveiliging)

##### 2.1 Context en risico’s

Het dashboard communiceert met een externe API (Hupie) waarvoor authenticatie vereist is. De belangrijkste beveiligingsrisico’s zijn:

• Credential-lekken: als de API-sleutel in de broncode terechtkomt (bijvoorbeeld via een git commit), kan iedereen met toegang tot de repository de API benaderen.

• Man-in-the-middle: als de communicatie niet versleuteld is, kan een aanvaller de data onderscheppen of manipuleren.

• Onbevoegde toegang: als de applicatie geen goede foutafhandeling heeft, zouden foutmeldingen gevoelige informatie kunnen onthullen (zoals de API-URL of interne structuur).

##### 2.2 Genomen maatregelen

|  |  |  |
|----|----|----|
| **Maatregel** | **Implementatie** | **Waarom** |
| Environment variables | API-URL en API-key worden opgeslagen in een .env bestand dat NIET in de git repository wordt opgenomen. Een .env.example bestand toont welke variabelen nodig zijn, zonder de daadwerkelijke waarden. | Voorkomt dat credentials in de broncode of git-geschiedenis terechtkomen. Zelfs als de repository openbaar zou worden, zijn de credentials niet zichtbaar. |
| .gitignore | Het. env bestand is expliciet opgenomen in .gitignore. Dit wordt gecontroleerd bij elke commit. | Extra vangnet: zelfs als een ontwikkelaar per ongeluk git add . uitvoert, wordt het .env bestand niet meegenomen. |
| Gecentraliseerde config | Een config/index.ts module leest de environment variables en exporteert ze als een getypt object. Alle services lezen uit deze module, niet direct uit process.env. | Voorkomt dat environment variables verspreid door de code worden gelezen. Maakt het eenvoudig om ontbrekende variabelen te detecteren bij het opstarten. |
| HTTPS | Alle communicatie met de Hupie API verloopt via HTTPS (TLS-versleuteling). | Voorkomt dat data of credentials onderschept kunnen worden tijdens transport (man-in-the-middle bescherming). |
| Foutafhandeling | Foutmeldingen in de UI tonen gebruiksvriendelijke berichten ("Er is een fout opgetreden"), niet de technische details van de API (geen URLs, geen stack traces, geen credentials). | Voorkomt information disclosure: een aanvaller kan geen interne structuur afleiden uit foutmeldingen. |
| Timeout-configuratie | API-aanroepen hebben een configureerbare timeout (standaard 10 seconden). Als de API niet reageert, wordt de aanroep afgebroken. | Voorkomt dat de applicatie onbeperkt blijft wachten, wat zowel een gebruikerservaring- als een beveiligingsrisico is (denial of service bij een trage API). |
| ErrorBoundary | Een React ErrorBoundary component vangt runtime-fouten op en toont een fallback-pagina in plaats van een witte pagina of een stack trace. | Voorkomt dat technische foutinformatie aan de eindgebruiker wordt getoond. Houdt de applicatie bruikbaar bij onverwachte fouten. |

##### 2.3 Buiten scope (bewust)

De volgende beveiligingsmaatregelen zijn bewust buiten scope gelaten voor deze Proof of Concept, maar zouden in een productieversie geïmplementeerd moeten worden:

• Gebruikersauthenticatie en -autorisatie (login, rollen, toegangscontrole)

• Content Security Policy (CSP) headers

• Rate limiting op API-aanroepen

• Audit logging van API-aanroepen

• Penetratietesting

Deze punten worden benoemd in de verbetervoorstellen (sectie 4 van het examenverslag).

#### 3. Ethiek

##### 3.1 Context

Het TDI 500 KPI Dashboard is een beslissingsondersteunend hulpmiddel. Installateurs en planners gebruiken de gepresenteerde data om keuzes te maken over welk installatieconcept het meest geschikt is voor een woningcontingent. Dit betekent dat de manier waarop data wordt gepresenteerd direct invloed heeft op beslissingen die financiële en maatschappelijke gevolgen hebben.

Als de data misleidend wordt gepresenteerd — bewust of onbewust — kan dat leiden tot verkeerde installatiebeslissingen, verspilling van middelen, of het benadelen van bepaalde woninggroepen.

##### 3.2 Eerlijke datavisualisatie

**Het dashboard hanteert de volgende principes voor eerlijke visualisatie:**

|  |  |  |
|----|----|----|
| **Principe** | **Implementatie** | **Wat het voorkomt** |
| Y-as begint bij nul (staafdiagrammen) | Alle staafdiagrammen (bar charts) in het dashboard beginnen de Y-as altijd bij 0. Dit is hard gecodeerd in de chart-configuratie. | Een staafdiagram dat niet bij 0 begint kan kleine verschillen visueel enorm overdrijven. Een verschil van 3000 vs 3100 kWh lijkt op het dubbele als de as bij 2900 begint. |
| Duidelijke aslabels met eenheden | Alle assen hebben een label met de meeteenheid (°C, kWh, kW, %). Geen as zonder label. | Voorkomt dat de gebruiker de schaal verkeerd interpreteert. Een getal "45" zonder eenheid is waardeloos. |
| Geen cherry-picking | Alle warmtepompen in het geselecteerde contingent worden getoond. Er worden geen systemen uitgefilterd om het gemiddelde beter te laten lijken. | Voorkomt selectieve presentatie die een vertekend beeld geeft van de werkelijke prestaties. |
| Toegankelijke kleuren | Het dashboard gebruikt niet alleen kleur om informatie over te brengen. Naast groen/geel/rood worden ook iconen en tekstlabels gebruikt (goed/acceptabel/slecht). | Ongeveer 8% van de mannen heeft een kleurenblindheid. Alleen kleur gebruiken sluit deze gebruikers uit. |
| Correcte schalen | Lijngrafieken gebruiken een passende min/max voor de Y-as op basis van de daadwerkelijke waarden, niet een willekeurige schaal. | Een temperatuurgrafiek met een schaal van 0–100°C terwijl alle waarden tussen 35–55°C liggen zou de variatie onzichtbaar maken. De schaal moet passen bij de data. |

##### 3.3 Beslissingsondersteuning, geen beslissing

Het Decision Support-component van het dashboard geeft een aanbeveling (goed/ acceptabel / slecht) op basis van de geaggregeerde KPI’s. Het is belangrijk dat deze aanbeveling wordt gepresenteerd als ondersteuning, niet als een definitief oordeel.

Concrete maatregelen:

• De aanbeveling wordt expliciet gelabeld als "beslissingsondersteuning" (niet als "conclusie" of "oordeel").

• Een disclaimer is zichtbaar: "Dit advies is gebaseerd op beschikbare meetdata en dient als ondersteuning, niet als definitief oordeel."

• De scoringscriteria en drempelwaarden zijn transparant en zichtbaar voor de gebruiker. Het is geen black box.

• Als de datakwaliteit laag is (weinig meetpunten, korte tijdsperiode), communiceert het dashboard dit expliciet in plaats van toch een aanbeveling te geven met vals vertrouwen.

##### 3.4 Verantwoord omgaan met data van derden

De data in het dashboard is afkomstig van de Hupie API, die is ontwikkeld door een externe partij (Klaas Andries de Graaf). Het dashboard presenteert deze data zo getrouw mogelijk zonder de data te manipuleren, te selecteren, of te interpreteren op een manier die niet door de data wordt ondersteund.

Waar het dashboard berekeningen uitvoert (gemiddelden, totalen, percentages), zijn deze berekeningen standaard statistische bewerkingen die transparant en reproduceerbaar zijn.

#### 4. Samenvatting

|  |  |  |
|----|----|----|
| **Onderwerp** | **Belangrijkste maatregel** | **Risico dat het adresseert** |
| Privacy | Aggregatie op contingentniveau, geen persoonsgegevens, geen lokale opslag | Herleidbaarheid van data tot individuele huishoudens |
| Security | Environment variables, .gitignore, HTTPS, gecentraliseerde config, ErrorBoundary | Credential-lekken, onderschepping, information disclosure |
| Ethiek | Y-as bij 0, duidelijke labels, geen cherry-picking, transparante scoring, disclaimer | Misleidende visualisatie die leidt tot verkeerde installatiebeslissingen |

Deze maatregelen zijn geïmplementeerd als onderdeel van het ontwerpproces (privacy en ethiek by design), niet achteraf toegevoegd. Ze zijn terug te vinden in de code (chart-configuratie, config module, ErrorBoundary), in de architectuur (aggregatielaag, geen lokale opslag), en in de UI (disclaimer, transparante drempelwaarden).

# 2. Realiseren (B1-K1-W3)

## 2.1 Lijst toegewezen user stories

*[Lijst van alle user stories die je hebt uitgewerkt, met issue-nummers.]*

## 2.2 Screenshots uitgewerkte functionaliteiten

Per feature: screenshot van de werkende functionaliteit met een korte beschrijving.

Issue \#2 — Hupie API Connection:

*[Beschrijving van wat je hebt gebouwd]*

*[Screenshot: API Connection — werkende feature]*

Issue \#3 — Data Mapping:

*[Beschrijving]*

*[Screenshot: Data Mapping — werkende feature]*

Issue \#4 — Contingent Link:

*[Beschrijving]*

*[Screenshot: Contingent Link — werkende feature]*

Issue \#5 — Dashboard UI:

*[Beschrijving]*

*[Screenshot: Dashboard UI — desktop]*

*[Screenshot: Dashboard UI — tablet]*

Issue \#6 — KPI Charts:

*[Beschrijving]*

*[Screenshot: KPI Charts — line chart]*

*[Screenshot: KPI Charts — bar chart]*

*[Screenshot: KPI Charts — gauge chart]*

*[Screenshot: KPI Summary Cards]*

Issue \#7 — Decision Support:

*[Beschrijving]*

*[Screenshot: Decision Support — good recommendation]*

*[Screenshot: Decision Support — poor recommendation]*

## 2.3 Screenshots code

Relevante code-screenshots per feature:

*[Screenshot: Code: hupieApi.ts + config/index.ts]*

*[Screenshot: Code: dataMapper.ts + types]*

*[Screenshot: Code: contingentService.ts + kpiAggregator.ts]*

*[Screenshot: Code: useDashboardData hook]*

*[Screenshot: Code: DashboardPage component]*

*[Screenshot: Code: chart components]*

*[Screenshot: Code: decisionEngine.ts + scoringConfig.ts]*

## 2.4 Screenshots commit-geschiedenis en branches

*[Screenshot: GitHub — branch overzicht]*

*[Screenshot: GitHub — commit history]*

*[Screenshot: GitHub — Pull Request voorbeeld]*

# 3. Testen (B1-K1-W4)

## 3.1 Testplan

*[Beschrijf het testplan: twee-laags aanpak (Vitest voor logica, handmatig voor UI). Wat wordt getest, hoe, met welke data, wat is pass/fail.]*

## 3.2 Automatische testen (Vitest)

Unit tests voor de data- en logica-laag:

*[Screenshot: Vitest terminal output — alle tests passing]*

*[Kopieer of beschrijf de test resultaten. Bij een initieel gefaalde test: screenshot van fout + fix + screenshot van geslaagde hertest.]*

## 3.3 Handmatige testscenario’s

*[Per user story: test ID, actie, verwacht resultaat, werkelijk resultaat, screenshot, verdict. Gebruik de T[issue].[test] naamgeving.]*

Issue \#2 — API Connection:

*[T2.1 Happy flow, T2.2 Invalid credentials, T2.3 API unreachable, T2.4 Malformed URL]*

*[Screenshot: T2.1 — Happy flow]*

*[Screenshot: T2.2 — Invalid credentials]*

*[Screenshot: T2.3 — API unreachable]*

Issue \#3 — Data Mapping:

*[T3.1 Happy flow, T3.2 Missing fields, T3.3 Unknown URI, T3.4 Empty response]*

*[Screenshot: T3.1 — Happy flow]*

Issue \#4 — Contingent Link:

*[T4.1 Happy flow, T4.2 Empty contingent, T4.3 Rapid switching, T4.4 Loading fails]*

*[Screenshot: T4.1 — Happy flow]*

Issue \#5 — Dashboard UI:

*[T5.1 Desktop, T5.2 Tablet, T5.3 Long names, T5.4 Slow response]*

*[Screenshot: T5.1 — Desktop layout]*

*[Screenshot: T5.2 — Tablet layout]*

Issue \#6 — KPI Charts:

*[T6.1 Happy flow, T6.2 Single data point, T6.3 No data, T6.4 Extreme values]*

*[Screenshot: T6.1 — Happy flow]*

Issue \#7 — Decision Support:

*[T7.1 Good score, T7.2 Poor score, T7.3 Insufficient data, T7.4 Missing KPIs, T7.5 All errors]*

*[Screenshot: T7.1 — Good score]*

*[Screenshot: T7.2 — Poor score]*

## 3.4 Test summary table

*[Vul de tabel in na het uitvoeren van alle testen]*

| **Test ID** | **Type**  | **Feature**      | **Beschrijving**              | **Resultaat**   |
|-------------|-----------|------------------|-------------------------------|-----------------|
| T-AUTO-3.1  | Auto      | Data Mapping     | parseMeasurements valid input | *[PASS/FAIL]* |
| T-AUTO-3.2  | Auto      | Data Mapping     | parseMeasurements empty       | *[PASS/FAIL]* |
| T-AUTO-4.1  | Auto      | KPI Aggregator   | aggregateKPIs valid           | *[PASS/FAIL]* |
| T-AUTO-7.1  | Auto      | Decision Engine  | evaluateContingent good       | *[PASS/FAIL]* |
| T2.1        | Handmatig | API Connection   | Happy flow — 200 OK           | *[PASS/FAIL]* |
| T2.2        | Handmatig | API Connection   | Invalid credentials           | *[PASS/FAIL]* |
| T4.1        | Handmatig | Contingent Link  | Select contingent             | *[PASS/FAIL]* |
| T5.1        | Handmatig | Dashboard UI     | Desktop layout                | *[PASS/FAIL]* |
| T6.1        | Handmatig | KPI Charts       | Charts with real data         | *[PASS/FAIL]* |
| T7.1        | Handmatig | Decision Support | Good recommendation           | *[PASS/FAIL]* |

## 3.5 Conclusies uit testen

Conclusie per feature:

*[Per feature: hoeveel tests geslaagd/gefaald, zijn acceptatiecriteria behaald, bekende issues.]*

Algehele conclusie:

*[Algemene kwaliteit van de applicatie. Sterke punten. Verbeterpunten (input voor verbetervoorstellen).]*

# 4. Verbetervoorstellen (B1-K1-W5)

## 4.1 Analyse informatiebronnen

Testresultaten:

*[Welke testen faalden? Welke edge cases waren problematisch?]*

Feedback sprint review (Jeroen Pat):

*[Wat zei Jeroen tijdens de review? Positief? Verzoeken? Issues?]*

Retrospective bevindingen:

*[Procesproblemenm, tijdsinschatting, werkwijze]*

Bugs / GitHub Issues:

*[Bugs gevonden tijdens de sprint die niet zijn opgelost]*

## 4.2 Interpretatie bevindingen

*[Per bevinding: wat is het onderliggende probleem? Hoe ernstig? Wie wordt geraakt?]*

## 4.3 Verbetervoorstellen

Voorstel 1 (functioneel):

*[Bron \| Probleem \| Voorstel \| Nieuwe user story + acceptatiecriteria \| Prioriteit (MoSCoW) \| Geschatte tijd]*

Voorstel 2 (technisch):

*[Bron \| Probleem \| Voorstel \| Nieuwe user story + acceptatiecriteria \| Prioriteit (MoSCoW) \| Geschatte tijd]*

Voorstel 3 (proces):

*[Bron \| Probleem \| Voorstel \| Nieuwe user story + acceptatiecriteria \| Prioriteit (MoSCoW) \| Geschatte tijd]*

## 4.4 Nieuwe user stories op product backlog

*[Beschrijf de nieuwe user stories die zijn toegevoegd aan het GitHub Projects scrumboard.]*

*[Screenshot: Product backlog met nieuwe user stories]*

# 5. Overleg (B1-K2-W1)

## 5.1 Scrumboard screenshots

Zie sectie 1.5 voor de dagelijkse scrumboard screenshots.

## 5.2 Overlegafspraken

*[Afspraken die niet op het scrumboard staan: technische beslissingen, API-gerelateerde keuzes, afspraken met Jeroen Pat.]*

## 5.3 Overzicht uitgevoerde activiteiten

*[Overzicht van wat er per dag is gedaan op basis van de gemaakte afspraken.]*

# 6. Reflectie (B1-K2-W3)

## 6.1 Proces

Wat ging goed:

*[Min. 2 concrete punten met verwijzing naar specifieke sprint-events]*

Wat kan beter:

*[Min. 2 concrete punten]*

Wat ga ik anders doen:

*[Min. 2 concrete acties]*

## 6.2 Samenwerking

Wat ging goed:

*[Min. 2 concrete punten over communicatie met Jeroen Pat, API developer]*

Wat kan beter:

*[Min. 2 concrete punten]*

Wat ga ik anders doen:

*[Min. 2 concrete acties]*

## 6.3 Eigen prestaties

Wat ging goed:

*[Min. 2 concrete punten — waar ben je trots op?]*

Wat kan beter:

*[Min. 2 concrete punten — waar worstelde je mee?]*

Wat ga ik anders doen:

*[Min. 2 concrete acties — welke skills ontwikkelen?]*