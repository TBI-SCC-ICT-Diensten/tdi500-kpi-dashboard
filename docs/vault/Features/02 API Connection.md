# Feature: Hupie API Authentication & Connection

**User Story:** #2
**Branch:** `feature/sparql-connection`
**Status:** To Do

---

## Acceptatiecriteria

### API Service
- [ ] Axios service in `/src/services/hupieApi.ts`
- [ ] Config from `/src/config/index.ts` (not process.env directly)
- [ ] `.env.example` exists, `.env` in `.gitignore`
- [ ] Missing config logs warning

### SPARQL Execution
- [ ] POST + GET, basic test query, 200 OK with JSON

### Error Handling
- [ ] Timeout (10s via config), HTTP errors caught, network failures caught
- [ ] Errors logged with context

### Response
- [ ] Raw JSON returned, typed as SparqlResponse
- [ ] No transformation (Issue #3)

---

## Before coding
- [ ] In Sprint Backlog & In Progress
- [ ] Branch: `git checkout -b feature/sparql-connection`

## When done
- [ ] Screenshots: API response, code, .env.example, PR
- [ ] Tested -> [[Tests/Test - API Connection]]
- [ ] DoD -> [[Definition of Done]]
