# Authentication — Implementation Log

Tracks each step from the RFC 0002 implementation plan as it's actually built.

---

## Step 1: Shared types

**What:** Add `UserRole`, `AuthUser`, `LoginResponse` to `@ticket-manager/types`.

**Status:** In progress

---

## Step 2: User entity + database table

**What:** Added `User` entity (email, passwordHash, role) with `email`
unique constraint, per RFC 0002's ambiguity table decision. Registered
`UsersModule` in `AppModule`.

**Status:** Done — `user` table confirmed created in MySQL via `SHOW TABLES`.

---

## Step 2: User entity + database table

**What:** Added `User` entity (email, passwordHash, role) with `email`
unique constraint, per RFC 0002's ambiguity table decision. Registered
`UsersModule` in `AppModule`.

**Status:** Done — `user` table confirmed created in MySQL via `SHOW TABLES`.

---

## Step 3: Password hashing + register logic

**What:** `UsersService.register()` — bcrypt hashing (cost 10), rejects
duplicate emails with `ConflictException`. Password strength is a
placeholder (min 8 chars) — still flagged "Decision Required" in RFC 0002.

**Status:** Done — 2/2 new unit tests passing (hash correctness,
duplicate-email rejection).

---

## Step 4: JWT login endpoint

**What:** `POST /auth/register` and `POST /auth/login`. Login verifies
password with bcrypt, issues a JWT (1-hour expiry per RFC 0002) embedding
`sub`, `email`, `role`.

**Debugging note:** Initial 404 was caused by `AuthModule` not actually
being registered in `app.module.ts` despite the write command appearing
to run — confirmed via `grep -n "AuthModule" app.module.ts` before
trusting the file was correct. Worth remembering: always verify a file
write landed, don't just assume the command succeeded.

**Status:** Done — real end-to-end test: register a user, login, receive
a valid JWT with correct embedded role.

---

## Step 5: Global guard + @Public() decorator

**What:** `JwtAuthGuard` applied app-wide via `APP_GUARD` — every route
protected by default. `/auth/register` and `/auth/login` explicitly
marked `@Public()` to opt out.

**Debugging notes (real issues hit, for future reference):**
1. `jest-e2e.json` needed `transformIgnorePatterns` fixed for pnpm's
   nested `.pnpm/@nestjs+jwt@<version>/` folder structure — the default
   Jest exclusion pattern doesn't account for pnpm's layout.
2. `supertest` needed a default import (`import request from 'supertest'`),
   not a namespace import (`import * as request from 'supertest'`).

**Status:** Done — proven via `apps/api/test/auth.e2e-spec.ts`, 4/4
passing: blocks without token, allows public routes, allows with valid
token, rejects garbage token.

**Known side effect:** `apps/web` is now broken (401) until Step 6 adds
a login form and attaches the token to requests.
