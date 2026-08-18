# Scouting: Ticket Management

## Current behavior (as implemented today)
- A ticket has: `id`, `title`, `status` (defaults to `"open"`), `createdAt`.
- Full CRUD exists: `POST /tickets`, `GET /tickets`, `GET /tickets/:id`, `PATCH /tickets/:id`, `DELETE /tickets/:id`.
- `title` is required and validated (`class-validator`); `status` is unrestricted free text.
- No authentication/authorization yet — any client can create/edit/delete any ticket.

## Who uses it
- Internal team members via the web UI (`apps/web`).

## What breaks if it fails
- Core feature of the product — this is P1 (business-critical, per the document's inventory criteria).

## Business criticality
P1 — this is the primary entity of the whole application.

## Ambiguity Tracking Table

| Feature | Current Behavior | Expected Behavior | PO Decision | Risk | Status | Action |
|---|---|---|---|---|---|---|
| `status` field | Free-text string, defaults to `"open"` | Unknown — should this be a fixed enum (`open`/`in_progress`/`closed`)? | Not decided | High | Decision Required | Escalate to PO before building any status-change UI |
| Ticket deletion | Hard delete (`DELETE /tickets/:id` removes the row permanently) | Unknown — should deleted tickets be recoverable (soft delete)? | Not decided | Medium | Decision Required | Escalate to PO before exposing delete in the UI |
| Authorization | None — no user identity attached to a ticket | Unknown — who can edit/delete which tickets? | Not decided | High | Investigation | Needs its own scouting pass once auth is designed |

## Rule (per the document, Part 2)
No final automated tests should be written yet for **status transitions** or **delete permissions**, since both are still "Decision Required." Tests for `create`/`read` (already-confirmed behavior) can be finalized now.
