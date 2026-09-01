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
