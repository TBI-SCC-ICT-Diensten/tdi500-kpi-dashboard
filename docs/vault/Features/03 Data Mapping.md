# Feature: Data Mapping (Ontology to Frontend)

**User Story:** #3
**Branch:** `feature/data-mapping`
**Status:** To Do

---

## Acceptatiecriteria

### TypeScript Interfaces
- [ ] HeatPumpSystem, Measurement, UnitOfMeasure, KPI, Contingent in `/src/types/`
- [ ] Exported, no `any` types

### Mapping Functions
- [ ] `/src/services/dataMapper.ts`
- [ ] parseMeasurements, parseContingents
- [ ] SAREF units resolved, timestamps to Date, strings to numbers

### Unit Lookup
- [ ] UNIT_MAP in `/src/types/units.ts`, unknown -> fallback

### Vitest Tests
- [ ] parseMeasurements: valid, empty, missing unit
- [ ] resolveUnit: known, unknown
- [ ] All pass, terminal screenshotted

---

## Before coding
- [ ] In Sprint Backlog & In Progress
- [ ] Branch: `git checkout -b feature/data-mapping`

## When done
- [ ] Screenshots: interfaces, mapping functions, mapped data, Vitest, PR
- [ ] Tested -> [[Tests/Test - Data Mapping]]
- [ ] DoD -> [[Definition of Done]]
