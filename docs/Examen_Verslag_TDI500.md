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

*[Voor elke technologiekeuze: waarom gekozen, welk alternatief overwogen, waarom niet gekozen.]*

React 18 met TypeScript:

*[Waarom React+TS vs Vue, Angular, vanilla JS?]*

Material UI v5:

*[Waarom MUI vs Chakra UI, Ant Design, Tailwind?]*

ApexCharts:

*[Waarom ApexCharts vs Recharts, Chart.js, D3?]*

Axios:

*[Waarom Axios vs fetch API?]*

Vitest:

*[Waarom Vitest vs Jest?]*

## 1.12 Onderbouwing ethiek, privacy en security

Privacy:

*[Beschrijf hoe het dashboard omgaat met potentieel herleidbare data. Alleen geanonimiseerde/geaggregeerde data. BAG-referenties op contingentniveau, niet individueel.]*

Security:

*[Beschrijf hoe API-credentials worden beheerd: .env, .gitignore, HTTPS. Geen credentials in de code.]*

Ethiek:

*[Beschrijf hoe de KPI-visualisaties eerlijk en niet misleidend zijn: correcte schalen, duidelijke labels, geen cherry-picked data.]*

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