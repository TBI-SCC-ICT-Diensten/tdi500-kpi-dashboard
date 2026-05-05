# Definition of Done

> Before any ticket moves to "Done", ALL of the following must be true.

## Code Quality
- [ ] Code follows project conventions: PascalCase for components, camelCase for variables/functions, one component per file
- [ ] TypeScript strict mode — no `any` types unless justified
- [ ] Code runs locally on `localhost:3000` without console errors or major linter warnings

## Version Control
- [ ] Work is done on a dedicated feature branch (`feature/[name]`)
- [ ] Feature branch is merged into `develop` via a Pull Request on GitHub
- [ ] Commits have clear, descriptive messages (e.g. `feat:`, `fix:`, `refactor:`)

## Testing & Acceptance
- [ ] All acceptance criteria on the user story are met
- [ ] Feature is tested: happy flow + at least 1 alternative scenario (e.g. empty data, API error)
- [ ] Test results are documented with screenshots
- [ ] If the feature has logic (mapping, aggregation, scoring): Vitest unit tests exist and pass

## Documentation (Exam Evidence)
- [ ] Screenshot of the working feature is saved
- [ ] Screenshot of relevant code is saved
- [ ] Screenshot of the PR / branch history is saved
- [ ] Scrumboard is updated (ticket moved to Done)

---

> **Note:** Design and documentation tickets (#1, #8, #9, #10, #11) follow their own acceptance criteria but still require scrumboard updates and saved screenshots.

> This must match the DoD on GitHub. If you update one, update both.
