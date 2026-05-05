# Feature: System Design & Architecture

**User Story:** #1 (B1-K1-W2)
**Branch:** none (documentation only)
**Status:** To Do

---

## Acceptatiecriteria

### Wireframes
- [x] Desktop wireframes for ALL routes: `/`, `/contingent/:id`, `/about`
- [x] Mobile/tablet wireframes for all routes
- [x] Exported and saved in `/docs/wireframes/`

### Sitemap / Routing
- [x] Sitemap: `/` (Dashboard), `/contingent/:id` (Detail), `/about` (Info)
- [x] Saved in `/docs/diagrams/`

### Component Diagram
- [x] Full architecture: Router, ErrorBoundary, ThemeProvider, DashboardProvider, useDashboardData, services, config
- [ ] Shows state ownership vs props
- [x] Saved in `/docs/diagrams/`

### UML Class Diagram
- [ ] Interfaces: Measurement, KPI, UnitOfMeasure, Contingent, HeatPumpSystem, DecisionScore, Recommendation
- [ ] Shows relationships and SPARQL/HCO/SAREF mapping
- [ ] Saved in `/docs/diagrams/`

### Sequence Diagram / Dataflow
- [ ] User -> React -> Axios -> Hupie API -> JSON -> dataMapper -> aggregator -> scoring -> hook -> UI
- [ ] Saved in `/docs/diagrams/`

### Technology Justification
- [ ] React+TS vs Vue, Angular, vanilla
- [ ] MUI vs Chakra, Ant Design, Tailwind
- [ ] ApexCharts vs Recharts, Chart.js, D3
- [ ] Axios vs fetch
- [ ] Vitest vs Jest
- [ ] Each: alternative considered + why not chosen

### Security, Privacy & Ethics
- [ ] Privacy: anonymized/aggregated, no household data
- [ ] Security: .env, .gitignore, HTTPS
- [ ] Ethics: honest charts, no misleading scales

---

## Notes
> Wireframes done in Figma. Diagrams and justifications still needed.
