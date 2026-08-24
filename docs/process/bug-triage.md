# Bug Triage Guide (for Developers)

When you pick up a bug, answer these in order:

## 1. Is this a regression, or a scouting gap?

- **Regression**: there's a clear, previously-correct behavior that broke.
  → Write a failing test that reproduces it. Fix. Confirm the test passes.
  Done — no PO involvement needed unless it's P1/data-loss.

- **Scouting gap**: the "expected" behavior was never actually decided by
  anyone (check `docs/scouting/*.md` for the relevant feature — if there's
  no entry, or it's marked "Investigation"/"Decision Required", this is a
  scouting gap, not a regression).
  → STOP. Do not guess. Open/update the scouting doc, tag PO, get a real
  decision. Then implement. This is slower but prevents the same ambiguity
  getting "fixed" inconsistently by different people later.

## 2. What severity?

- **P1** — data loss, core flow completely broken, security issue → fix now, notify PM
- **P2** — real bug but a workaround exists → normal sprint priority
- **P3** — cosmetic/edge case → backlog, batch with related work

## 3. Before opening the PR

- [ ] Failing test written FIRST (proves the bug existed and is now fixed)
- [ ] Root cause understood — not just "it works now" without knowing why
- [ ] Checked whether the same bug pattern exists elsewhere in the codebase
      (e.g., if it's a missing validation, check other DTOs for the same gap)
