# RFC 0002: Authentication (email + password, JWT)

Status: Accepted
Author: (you)
Date: 2026-08

---

## Section 1 — Feature Definition

**What:** Users register with email/password, log in, and receive a JWT
used to authenticate subsequent API requests.

**Why:** Prerequisite for RFC 0001 (role-based permissions) — that RFC
assumed a `User` entity and "logged-in user" concept that doesn't exist
yet. This RFC builds that foundation.

**Scope for v1:**
- Email + password registration and login
- JWT access token (short-lived, e.g. 1 hour) — NO refresh token yet
  (explicitly deferred to a future RFC if session length becomes a real
  problem — not solving a problem we don't have yet)
- Password hashing with bcrypt
- A `RolesGuard`-ready structure (built to plug into RFC 0001 directly,
  not duplicate it)

**Explicitly out of scope for v1:** password reset, email verification,
OAuth/social login, refresh tokens, multi-factor auth. Each would be its
own future RFC if/when actually needed.

---

## Section 2 — Scouting

### Current behavior
No `User` entity, no login, no protected routes — confirmed in
`docs/scouting/tickets.md`.

### Ambiguity Tracking Table

| Question | Expected | PO Decision | Risk | Status |
|---|---|---|---|---|
| Token lifetime? | Assumed 1 hour | **Decided: 1 hour** | Low | Ready |
| What happens on expired token? | 401, client must re-login | **Decided: 401, no silent refresh (v1)** | Low | Ready |
| Can two users share an email? | No | **Decided: email unique, enforced at DB level** | Medium | Ready |
| Minimum password strength? | Unclear | Not decided | Medium | Decision Required |

**Per the project's rule:** password strength enforcement is NOT finalized
until PO decides — implement a placeholder (min 8 chars) and flag it
clearly in code as pending a real decision.

---

## Section 3 — RFC

### Detailed Design

**New shared type** (`@ticket-manager/types`):
```typescript
export interface AuthUser {
  id: number;
  email: string;
  role: UserRole; // from RFC 0001
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
```

**New API pieces** (designed for extensibility — this is the
Open/Closed part):
- `User` entity (id, email, passwordHash, role, createdAt)
- `AuthModule` with a `PasswordAuthStrategy` — deliberately named/scoped
  so a future `OAuthStrategy` or `MagicLinkStrategy` can be added later
  as a NEW class, without modifying this one (Open/Closed Principle:
  open for extension via new strategies, closed for modification of
  existing login logic)
- `JwtStrategy` (Passport) for validating tokens on protected routes
- `@Public()` decorator for the few routes that DON'T need auth (login,
  register) — everything else is protected **by default**, which is
  safer than the opposite (having to remember to protect each route)
- Global `JwtAuthGuard` applied app-wide via `APP_GUARD`, so new
  controllers are protected automatically without extra wiring

### Alternatives Considered
- **Session-based auth (cookies)** — rejected: JWT is simpler to reason
  about for an API-first architecture, no server-side session store needed
- **Protect routes one-by-one with `@UseGuards()`** — rejected: too easy
  to forget on a new endpoint. Global guard + explicit `@Public()` opt-out
  is safer by default.

### Effect on Dependency Graph and Tests
Touches `@ticket-manager/types` (new `AuthUser`/`LoginResponse`) →
`@ticket-manager/api` (new module, entity, guards) →
`@ticket-manager/web` (login form, token storage, protected UI).
All three become "affected" — same proven pattern as before.

### Unresolved Questions
Password strength policy (see ambiguity table).

---

## Section 4 — RACI

| Step | PO | PM | Developer | QA |
|---|---|---|---|---|
| Resolve password-strength ambiguity | A | C | I | I |
| Approve this RFC | A | C | C | I |
| Implement User entity + password hashing | I | I | R | I |
| Implement JWT login/guard/strategy | I | I | R | C |
| Implement `@Public()` decorator + global guard | I | I | R | C |
| Write auth tests (unit + e2e login flow) | I | I | R | R |
| Update `apps/web` with login form | I | C | R | C |
| Validate: wrong password rejected, expired token rejected, protected routes actually blocked | I | I | C | R |
| Sign off for release | A | A | I | R |
