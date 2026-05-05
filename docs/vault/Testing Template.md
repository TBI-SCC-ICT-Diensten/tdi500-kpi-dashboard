# Testing Template

> For each user story, create a test note from [[Templates/Testing Template]].

---

## Test Approach

**Two layers:**
1. **Automated (Vitest)** — data mapping, aggregation, scoring logic. Runs in terminal via `npm run test`.
2. **Manual (browser)** — UI, layout, responsiveness, end-to-end flows. Documented with screenshots.

---

## Automated Test Tracker (Vitest)

### dataMapper.ts (Issue #3)
| ID | Test | Result |
|----|------|--------|
| T-AUTO-3.1 | parseMeasurements valid input | [ ] |
| T-AUTO-3.2 | parseMeasurements empty bindings | [ ] |
| T-AUTO-3.3 | parseMeasurements missing unit | [ ] |
| T-AUTO-3.4 | resolveUnit known URI | [ ] |
| T-AUTO-3.5 | resolveUnit unknown URI | [ ] |

### kpiAggregator.ts (Issue #4)
| ID | Test | Result |
|----|------|--------|
| T-AUTO-4.1 | aggregateKPIs valid measurements | [ ] |
| T-AUTO-4.2 | aggregateKPIs empty array | [ ] |
| T-AUTO-4.3 | aggregateKPIs null values | [ ] |

### decisionEngine.ts (Issue #7)
| ID | Test | Result |
|----|------|--------|
| T-AUTO-7.1 | evaluateContingent all good | [ ] |
| T-AUTO-7.2 | evaluateContingent all poor | [ ] |
| T-AUTO-7.3 | evaluateContingent mixed | [ ] |
| T-AUTO-7.4 | evaluateContingent empty | [ ] |

**Terminal output screenshot:** [ ] saved

---

## Manual Test Tracker

| User Story | Happy Flow | Alt 1 | Alt 2 | Alt 3 | Note |
|-----------|------------|-------|-------|-------|------|
| #2 API Connection | [ ] | [ ] | [ ] | [ ] | [[Tests/Test - API Connection]] |
| #3 Data Mapping | [ ] | [ ] | [ ] | | [[Tests/Test - Data Mapping]] |
| #4 Contingent Link | [ ] | [ ] | [ ] | [ ] | [[Tests/Test - Contingent Link]] |
| #5 Dashboard UI | [ ] | [ ] | [ ] | [ ] | [[Tests/Test - Dashboard UI]] |
| #6 KPI Charts | [ ] | [ ] | [ ] | [ ] | [[Tests/Test - KPI Charts]] |
| #7 Decision Support | [ ] | [ ] | [ ] | [ ] | [[Tests/Test - Decision Support]] |
