# Feature: Automated Contingent Link

**User Story:** #4
**Branch:** `feature/contingent-filter`
**Status:** To Do

---

## Acceptatiecriteria

### Loading & Selection
- [ ] Contingents fetched from API, selection component, loading + error states

### Filtering
- [ ] filterByContingent() in contingentService.ts
- [ ] Uses ontology relationships, empty -> message

### KPI Aggregation
- [ ] aggregateKPIs() in kpiAggregator.ts
- [ ] Avg COP, total energy, avg temps, uptime %, error count
- [ ] Edge cases handled

### State (Custom Hook + Context)
- [ ] useDashboardData hook: selectedContingent, filteredSystems, kpis, recommendation
- [ ] useMemo for derived data, DashboardProvider context

### Vitest Tests
- [ ] filterByContingent: matching, no matches
- [ ] aggregateKPIs: valid, empty, null values

---

## Before coding
- [ ] In Sprint Backlog & In Progress
- [ ] Branch: `git checkout -b feature/contingent-filter`

## When done
- [ ] Screenshots: selector, data changing, code, Vitest, PR
- [ ] Tested -> [[Tests/Test - Contingent Link]]
- [ ] DoD -> [[Definition of Done]]
