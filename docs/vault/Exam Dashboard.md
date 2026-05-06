# TDI 500 — Exam Dashboard

> **Sprint:** 16 maart – 27 maart 2026
> **Kandidaat:** Destiny Tiyjudy | 9015646 | PALVSOD3B
> **GitHub:** [tdi500-kpi-dashboard](https://github.com/Marvel-School/tdi500-kpi-dashboard)

---

## Sprint Progress

| Dag | Datum | Stand-up | Scrumboard | Notes |
|-----|-------|----------|------------|-------|
| 1 | Ma 16 mrt | [ ] | [ ] | |
| 2 | Di 17 mrt | [ ] | [ ] | |
| 3 | Wo 18 mrt | [ ] | [ ] | |
| 4 | Do 19 mrt | [ ] | [ ] | |
| 5 | Vr 20 mrt | [ ] | [ ] | |
| 6 | Ma 23 mrt | [ ] | [ ] | |
| 7 | Di 24 mrt | [ ] | [ ] | |
| 8 | Wo 25 mrt | [ ] | [ ] | |
| 9 | Do 26 mrt | [ ] | [ ] | |
| 10 | Vr 27 mrt | [ ] | [ ] | |

---

## User Stories Tracker

### Feature Tickets

| # | User Story | Branch | PR | Tested | Screenshots | Done |
|---|-----------|--------|-----|--------|-------------|------|
| 1 | System Design & Architecture | — | — | — | [ ] | [ ] |
| 2 | Hupie API Authentication | `feature/sparql-connection` | [ ] | [ ] | [ ] | [ ] |
| 3 | Data Mapping (Ontology to Frontend) | `feature/data-mapping` | [ ] | [ ] | [ ] | [ ] |
| 4 | Automated Contingent Link | `feature/contingent-filter` | [ ] | [ ] | [ ] | [ ] |
| 5 | Dashboard UI & Architecture | `feature/dashboard-layout` | [ ] | [ ] | [ ] | [ ] |
| 6 | KPI Visualization | `feature/kpi-charts` | [ ] | [ ] | [ ] | [ ] |
| 7 | Decision Support Interface | `feature/decision-support` | [ ] | [ ] | [ ] | [ ] |

### Non-Code Tickets

| # | Ticket | When | Done |
|---|--------|------|------|
| 8 | Test Plan & Execution | Wo 25 mrt | [ ] |
| 9 | Verbetervoorstellen | Do 26 mrt | [ ] |
| 10 | Sprint Review / Presentatie | Vr 27 mrt | [ ] |
| 11 | Retrospective | Vr 27 mrt | [ ] |

---

## Architecture Quick Reference

```
App.tsx
  ThemeProvider (custom MUI theme)
    BrowserRouter (React Router)
      ErrorBoundary
        DashboardProvider (Context + useDashboardData hook)
          MainLayout (Header + Sidebar + Content)
            Routes:
              / → DashboardPage
              /contingent/:id → ContingentDetailPage
              /about → AboutPage
              * → NotFoundPage
```

```
Data flow:
  Hupie API (SPARQL)
    → hupieApi.ts (Axios, reads config.ts)
    → dataMapper.ts (raw JSON → typed models)
    → contingentService.ts (filter by contingent)
    → kpiAggregator.ts (calculate KPIs)
    → decisionEngine.ts (score + recommend)
    → useDashboardData hook (state + derived data)
    → UI components (charts, cards, recommendation)
```

---

## Exam Verslag Sections

> Check off each section as you write it. ALL must be done by Vr 27 mrt.

### Opdracht 1 — Planning & Ontwerp (W1 + W2)
- [ ] Eisen, wensen en technische uitgangspunten
- [ ] User stories met acceptatiecriteria
- [ ] Definition of Done
- [ ] Screenshot sprint backlog (begin sprint)
- [ ] Screenshots scrumboard (dagelijks)
- [ ] Wireframes desktop + mobiel (alle routes: /, /contingent/:id, /about)
- [ ] Sitemap / routing structure
- [ ] Componentendiagram (React architectuur incl. Router, ErrorBoundary, Context, Hook)
- [ ] UML class diagram (TypeScript interfaces)
- [ ] Dataflow-diagram (Hupie API → dataMapper → aggregator → scoring → UI)
- [ ] Onderbouwing technologiekeuzes (React, TypeScript, MUI, ApexCharts, Vitest + alternatieven)
- [ ] Onderbouwing ethiek, privacy en security

### Opdracht 2 — Realiseren (W3)
- [ ] Lijst toegewezen user stories
- [ ] Screenshots uitgewerkte functionaliteiten + beschrijving
- [ ] Screenshots code
- [ ] Screenshots commit-geschiedenis en branches

### Opdracht 3 — Testen (W4)
- [ ] Testplan (twee-laags: Vitest + handmatig)
- [ ] Vitest unit test resultaten (terminal output screenshot)
- [ ] Handmatige testscenario's per user story
- [ ] Testresultaten (screenshots)
- [ ] Conclusies uit testen
- [ ] Test summary table

### Opdracht 4 — Verbetervoorstellen (W5)
- [ ] Analyse informatiebronnen
- [ ] Interpretatie bevindingen
- [ ] Verbetervoorstellen (min. 3: functioneel + technisch + proces)
- [ ] Nieuwe user stories + MoSCoW prioriteit + tijdsinschatting
- [ ] Screenshot product backlog met nieuwe stories

### Opdracht 5 — Overleg (W6)
- [ ] Screenshots scrumboard na elke update
- [ ] Overlegafspraken (niet op scrumboard) → [[Overleg & Afspraken]]
- [ ] Overzicht uitgevoerde activiteiten

### Opdracht 6 — Presentatie (W7)
- [ ] Demo voorbereid en uitgevoerd
- [ ] Feedback genoteerd → [[Verbetervoorstellen]]

### Opdracht 7 — Reflectie (W8)
- [ ] Reflectie: proces
- [ ] Reflectie: samenwerking
- [ ] Reflectie: eigen prestaties

---

## Quick Links

- [[Feature Branch Checklist]]
- [[Testing Template]]
- [[Verbetervoorstellen]]
- [[Retrospective]]
- [[Overleg & Afspraken]]
- [[Definition of Done]]
