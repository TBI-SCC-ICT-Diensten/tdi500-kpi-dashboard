# Feature: KPI Visualization

**User Story:** #6
**Branch:** `feature/kpi-charts`
**Status:** To Do

---

## Acceptatiecriteria

### Charts Setup
- [ ] react-apexcharts installed, BaseChart wrapper
- [ ] Colors from MUI theme, data from useDashboardData

### KPI Summary Cards
- [ ] Total pumps, avg COP, total energy, uptime %, errors
- [ ] Update on contingent change

### Charts
- [ ] Line/Area: temperature trends (timestamps, multiple series)
- [ ] Bar: energy per system (Y starts at 0)
- [ ] Gauge: COP (green/yellow/red zones)

### States & Responsiveness
- [ ] Loading: spinner, Empty: EmptyState
- [ ] Charts resize, stack on tablet

### Ethical
- [ ] Y-axis at 0, no misleading scales, accessible colors

---

## Before coding
- [ ] In Sprint Backlog & In Progress
- [ ] Branch: `git checkout -b feature/kpi-charts`

## When done
- [ ] Screenshots: charts, cards, responsive, code, PR
- [ ] Tested -> [[Tests/Test - KPI Charts]]
- [ ] DoD -> [[Definition of Done]]
