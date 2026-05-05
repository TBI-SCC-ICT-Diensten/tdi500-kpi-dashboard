# Feature Branch Checklist

> Use this as a quick reference. For each feature, create a new note from [[Templates/Feature Branch Template]].

---

## Git Workflow (every time)

```bash
# 1. Start from develop
git checkout develop
git pull

# 2. Create feature branch
git checkout -b feature/[short-name]

# 3. Code, commit often
git add .
git commit -m "feat: description of what you did"

# 4. Push to remote
git push -u origin feature/[short-name]

# 5. When done: create PR on GitHub
# feature/[short-name] → develop

# 6. Merge the PR on GitHub

# 7. Back to develop locally
git checkout develop
git pull
```

---

## Commit Message Format

| Prefix | When |
|--------|------|
| `feat:` | New functionality |
| `fix:` | Bug fixed |
| `refactor:` | Code cleaned up, no behavior change |
| `docs:` | Documentation added/changed |
| `style:` | Formatting only, no code change |
| `test:` | Tests added |
| `config:` | Configuration changes (theme, env, eslint) |

---

## Feature Tickets

| # | Feature | Branch | Status |
|---|---------|--------|--------|
| 1 | [[Features/01 System Design]] | — (documentation) | |
| 2 | [[Features/02 API Connection]] | `feature/sparql-connection` | |
| 3 | [[Features/03 Data Mapping]] | `feature/data-mapping` | |
| 4 | [[Features/04 Contingent Link]] | `feature/contingent-filter` | |
| 5 | [[Features/05 Dashboard UI]] | `feature/dashboard-layout` | |
| 6 | [[Features/06 KPI Charts]] | `feature/kpi-charts` | |
| 7 | [[Features/07 Decision Support]] | `feature/decision-support` | |

## Non-Code Tickets

| # | Ticket | Status |
|---|--------|--------|
| 8 | [[Features/08 Testing]] | |
| 9 | [[Features/09 Verbetervoorstellen]] | |
| 10 | [[Features/10 Sprint Review]] | |
| 11 | [[Features/11 Retrospective]] | |
