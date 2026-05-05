# Feature: Decision Support Interface

**User Story:** #7
**Branch:** `feature/decision-support`
**Status:** To Do

---

## Acceptatiecriteria

### Card
- [ ] Visually distinct, clear heading, positioned per wireframes

### Scoring
- [ ] decisionEngine.ts + scoringConfig.ts (configurable thresholds)
- [ ] Evaluates: COP, energy, reliability, temperatures
- [ ] Individual + overall: good/acceptable/poor
- [ ] Typed: DecisionScore, Recommendation

### Visual
- [ ] Color + icon + summary, factor breakdown, suggested action
- [ ] Accessible (not color alone)

### Dynamic + Edge Cases
- [ ] Updates on contingent change, loading state
- [ ] Insufficient data -> message, missing KPIs -> N/A

### Ethical
- [ ] Labeled as support, transparent thresholds, disclaimer

### Vitest Tests
- [ ] Good, poor, mixed, empty, null KPI scenarios

---

## Before coding
- [ ] In Sprint Backlog & In Progress
- [ ] Branch: `git checkout -b feature/decision-support`

## When done
- [ ] Screenshots: all 3 states, breakdown, edge cases, code, Vitest, PR
- [ ] Tested -> [[Tests/Test - Decision Support]]
- [ ] DoD -> [[Definition of Done]]
