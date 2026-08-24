# RFC 0001: Role-Based Permissions (PO / PM / Developer / QA)

Status: Draft
Author: (you)
Date: 2026-08

---

## Section 1 — Feature Definition

**What:** Introduce authenticated users, each assigned exactly one role —
`PO`, `PM`, `DEVELOPER`, or `QA` — and enforce different ticket
permissions per role.

**Why:** Right now (confirmed in `docs/scouting/tickets.md`), there is
**no authentication or authorization at all** — any client can create,
edit, or delete any ticket. That's fine for a prototype, not for a real
product.

**Scope for v1:** Ticket-level permissions only. Does NOT include: user
registration UI, password reset, multi-role users, or org/team-level
permissions — those are explicitly out of scope, to be scouted separately
if/when needed.

---

## Section 2 — Scouting

### Current behavior
- No `User` entity exists at all.
- No authentication middleware/guard exists.
- Every ticket endpoint is fully open.

### Expected behavior (draft — see ambiguities below)
- A logged-in user has exactly one role.
- Permissions differ by role (see permission matrix in Section 3).

### Ambiguity Tracking Table

| Question | Current State | Expected | PO Decision | Risk | Status |
|---|---|---|---|---|---|
| Can a user have more than one role? | N/A (no users yet) | Assumed: no, one role per user, v1 | **Decided: single role only** | Medium | Ready |
| Can PO delete ANY ticket, or only ones they created? | N/A | Assumed: any ticket (PO is highest authority) | **Decided: any ticket** | Medium | Ready |
| Can Developer see tickets not assigned to them? | N/A | Unclear | Not decided | Low | Decision Required |
| What happens to existing tickets created before auth existed (no owner)? | N/A | Unclear — needs a migration decision | Not decided | High | Decision Required |

**Per the project's own rule:** the two "Decision Required" rows must be
resolved by PO before their related permission logic is finalized/tested.
Everything else below can proceed.

---

## Section 3 — RFC (this document doubles as the RFC)

### Summary
Add a `User` entity with a `role` enum, a simple auth layer (JWT), and
NestJS guards that enforce the following permission matrix.

### Motivation
See Section 1. Currently zero access control — a real risk once this
moves past prototype stage.

### Detailed Design

**Permission matrix (v1):**

| Action | PO | PM | Developer | QA |
|---|---|---|---|---|
| Create ticket | ✅ | ✅ | ❌ | ❌ |
| View all tickets | ✅ | ✅ | ✅ | ✅ |
| Update status: any → any | ✅ | ✅ | ❌ | ❌ |
| Update status: assigned ticket only | — | — | ✅ (open→in_progress→resolved) | ✅ (resolved→closed only) |
| Delete ticket | ✅ | ❌ | ❌ | ❌ |

**New shared type** (`@ticket-manager/types`):
```typescript
export type UserRole = 'PO' | 'PM' | 'DEVELOPER' | 'QA';
```

**New API pieces:**
- `User` entity (`id`, `email`, `passwordHash`, `role`)
- `AuthModule` (JWT-based login, issues a token with `role` embedded)
- `RolesGuard` + `@Roles(...)` decorator on ticket endpoints
- Ownership check for Developer/QA (assigned-ticket-only rules)

### Alternatives considered
- **No roles, just "logged in or not"** — rejected: doesn't solve the
  actual problem (PO/PM need broader access than Developer/QA).
- **Permissions stored in DB (fully dynamic RBAC)** — rejected for v1:
  real complexity, not justified yet for 4 fixed roles. Can revisit via a
  future RFC if roles need to become dynamic/configurable.

### Drawbacks
- Every existing ticket endpoint needs a breaking change (auth required).
- Existing manual `curl` testing workflow (Section 7 of the status-enum
  doc) will need a token from now on.

### Effect on dependency graph and tests (per Section 5/7 of the main doc)
Touches `@ticket-manager/types` (new `UserRole` type) →
`@ticket-manager/api` (new module + guards) →
`@ticket-manager/web` (login form, role-aware UI).
All three packages become "affected" for any change here — same pattern
proven in `docs/examples/ticket-status-enum.md`.

### Unresolved Questions
The two "Decision Required" rows from Section 2's ambiguity table.

---

## Section 4 — RACI

| Step | PO | PM | Developer | QA |
|---|---|---|---|---|
| Resolve open ambiguities (Section 2) | A | C | I | I |
| Approve this RFC | A | C | C | I |
| Define permission matrix (Section 3) | A | R | C | C |
| Implement `User` entity + auth | I | I | R | I |
| Implement `RolesGuard` + decorators | I | I | R | C |
| Write permission tests per role | I | I | R | R |
| Validate matrix matches real behavior | I | A | C | R |
| Sign off for release | A | A | I | R |

*(R = does the work, A = final approval, C = consulted, I = informed —
same convention as the main process document.)*

---

## Section 5 — Implementation Plan (high-level; full code next if you want it)

1. Add `User` entity + `UserRole` type to `@ticket-manager/types` and `api`
2. Add `AuthModule` (JWT login endpoint)
3. Add `RolesGuard` + `@Roles()` decorator, apply to `TicketsController`
4. Add ownership check for Developer/QA assigned-ticket rules
5. Update `apps/web` with a login form + store the JWT
6. Write tests: one per permission-matrix row (12 rows = 12 test cases minimum)
7. QA validates the two "Decision Required" rows are actually resolved before signing off
