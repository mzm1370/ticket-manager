# Feature Lifecycle (idea → shipped), and what "done" means

This is the operational version of the project's process document, applied
to this repo specifically.

## Stages

1. **Idea & Intake** — open a Feature Request issue (`.github/ISSUE_TEMPLATE/feature_request.yml`).
   PO/PM assign a risk tier (P1/P2/P3).
2. **Scouting** — fill in Current/Expected behavior on the issue. Anything
   undecided gets flagged, not guessed at. PO resolves it before stage 3.
3. **RFC check** — if the issue's RFC checklist has any box checked, write
   `docs/rfcs/NNNN-<name>.md` from the template BEFORE writing code.
4. **RACI** — PO assigns who does what (see `docs/rfcs/0001-role-based-permissions.md`
   for a real example table).
5. **Implementation** — Developer builds it, tests co-located with code.
6. **Test & targeted verification** — `pnpm turbo run test --filter=...[origin/main]`
   must pass; confirm which packages the dependency graph marks as affected
   actually matches what you expect (if it doesn't, the graph/boundaries
   may be wrong — fix that before merging, don't just ignore it).
7. **Review** — PR opened using the PR template; Definition of Done checklist
   fully checked before requesting review.
8. **Release & observe** — merged, deployed, PO/QA confirm real behavior
   matches acceptance criteria from the original issue.

## Definition of Done — a feature is NOT done until ALL of these are true

- [ ] Acceptance criteria from the intake issue are met exactly (not "close enough")
- [ ] No "Decision Required" scouting rows remain for the behavior actually shipped
- [ ] RFC (if required) is `Accepted`, not still `Draft`
- [ ] Tests exist at the right level (unit for logic, integration for cross-component, E2E for full flow)
- [ ] `turbo run test --filter=...` was actually run and passed — not just "should pass"
- [ ] QA has manually verified against the acceptance criteria, not just trusted green CI
- [ ] Docs updated if this changed shared behavior other developers rely on

## When a bug is found (developer guidance — see docs/process/bug-triage.md for detail)

Do NOT immediately patch and move on. First classify:
- **Regression** → write a failing test reproducing it, then fix, confirm test now passes
- **Scouting gap** (behavior was never actually defined) → do NOT guess the fix.
  Escalate to PO as a mini-scouting question first. Guessing here is exactly
  how the same ambiguity gets "fixed" three different incompatible ways
  by three different developers over time.
