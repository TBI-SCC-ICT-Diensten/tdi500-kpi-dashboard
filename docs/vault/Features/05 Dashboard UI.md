# Feature: Dashboard UI & Component Architecture

**User Story:** #5
**Branch:** `feature/dashboard-layout`
**Status:** To Do

---

## Acceptatiecriteria

### Routing
- [ ] react-router-dom: `/`, `/contingent/:id`, `/about`, `*` (404)
- [ ] Nav links work, active highlighted

### Shell
- [ ] Header, Sidebar/Nav, Content, Footer
- [ ] MUI components, matches wireframes

### Error Boundary
- [ ] Wraps content (not nav), fallback + refresh button

### Custom MUI Theme
- [ ] theme.ts: colors, typography, component overrides
- [ ] ThemeProvider in App.tsx, zero hardcoded colors

### Structure
- [ ] Folders: common/, layout/, dashboard/, detail/, about/, charts/
- [ ] One file per component, typed props, max ~200 lines

### Placeholders + Reusable Components
- [ ] DashboardPage with placeholders for all panels
- [ ] LoadingSpinner, ErrorMessage, EmptyState

### Responsive
- [ ] Desktop (1440px+), Tablet (768px), no horizontal scroll

---

## Before coding
- [ ] In Sprint Backlog & In Progress
- [ ] Branch: `git checkout -b feature/dashboard-layout`

## When done
- [ ] Screenshots: desktop, tablet, folder structure, App.tsx, PR
- [ ] Tested -> [[Tests/Test - Dashboard UI]]
- [ ] DoD -> [[Definition of Done]]

> Independent of API. Build with placeholders.
