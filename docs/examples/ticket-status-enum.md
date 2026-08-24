# Feature Walkthrough: Restricting Ticket Status (PO → QA, real example)

This is a complete, linear walkthrough of one real feature, from decision
to shipped and tested code, using this actual repo.

---

## Section 1 — Where this came from (Scouting)

`docs/scouting/tickets.md` already flagged this open question:

> `status` field — free text, defaults to `"open"` — **Decision Required**

## Section 2 — PO Decision

`status` becomes a fixed set: `open`, `in_progress`, `resolved`, `closed`.
Anything else is rejected by the API.

## Section 3 — Dependency Graph (why this touches 3 packages, not 1)

`status`'s type lives in `@ticket-manager/types`, which both `api` and `web`
depend on. Generate the real graph to see this for yourself:

```bash
pnpm turbo run build --graph=graph.html
```
Open `graph.html` in a browser — you'll see `api` and `web` both pointing
to `types`. That's why one type change below "affects" all three.

## Section 4 — RFC Check

Changes a shared package's public type → normally RFC-track. On a solo
project, this doc IS the lightweight equivalent — decision logged, not lost.

## Section 5 — Implementation

### 5.1 Update the shared type

Edit `packages/types/src/index.ts` to:
```typescript
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: number;
  title: string;
  status: TicketStatus;
  createdAt: string;
}
```

### 5.2 Update the API entity

Edit `apps/api/src/tickets/entities/ticket.entity.ts`:
```typescript
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { TicketStatus } from '@ticket-manager/types';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  })
  status: TicketStatus;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 5.3 Update the update-DTO to validate status

Edit `apps/api/src/tickets/dto/update-ticket.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';
import type { TicketStatus } from '@ticket-manager/types';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsIn(['open', 'in_progress', 'resolved', 'closed'])
  status?: TicketStatus;
}
```

### 5.4 Update the web UI — a real dropdown instead of plain text

Edit `apps/web/src/App.tsx`, replace the `<li>` line with:
```tsx
<li key={t.id}>
  #{t.id} — {t.title}{' '}
  <select value={t.status} disabled>
    <option value="open">open</option>
    <option value="in_progress">in_progress</option>
    <option value="resolved">resolved</option>
    <option value="closed">closed</option>
  </select>
</li>
```
(`disabled` for now — read-only display; wiring the actual update button is a separate future feature, intentionally out of scope here.)

### 5.5 Apply the change to your running database

Since `synchronize: true` is on for local dev, just restart the API:
```bash
# in the terminal running start:dev, Ctrl+C then:
pnpm --filter @ticket-manager/api run start:dev
```
MySQL's schema updates automatically to the new `enum` column.

## Section 6 — Test Grouping / Targeted Execution Proof

```bash
git add packages/types apps/api apps/web
git commit -m "feat: restrict ticket status to fixed enum"
pnpm turbo run test --filter=...[HEAD^1]
```
Expected: **all three** — `@ticket-manager/types`, `@ticket-manager/api`,
`@ticket-manager/web` — show as affected/tested, unlike our earlier
web-only change. This is the dependency graph from Section 3, proven live.

## Section 7 — QA Validation

```bash
# Valid status — should succeed
curl -X PATCH http://localhost:3000/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# Invalid status — should be REJECTED with a 400 error
curl -X PATCH http://localhost:3000/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "banana"}'
```

QA sign-off checklist:
- [ ] Valid status update returns `200` with updated ticket
- [ ] Invalid status update returns `400`
- [ ] Web UI shows the dropdown with the correct current value
- [ ] `docs/scouting/tickets.md` ambiguity row updated to "Ready"
