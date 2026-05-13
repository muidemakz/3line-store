# Session & Points Engine

This is the core business logic of the platform. Understanding this document is essential before touching anything related to sessions, points, or checkout.

---

## The `UserSessionPoints` Table

This table is the **single source of truth** for a user's point balance within a session.

```prisma
model UserSessionPoints {
  id               String   @id @default(cuid())
  userId           String
  sessionId        String
  allocatedPoints  Int      @default(0)   // Total points given this session
  remainingPoints  Int      @default(0)   // Points left to spend
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([userId, sessionId])           // One record per user per session
}
```

- `allocatedPoints` — the total number of points the user was given for this session. Does not change after allocation (unless re-allocated by admin).
- `remainingPoints` — decrements on every checkout. Must never go below 0.
- The unique constraint on `(userId, sessionId)` means a user has exactly one points record per session.

---

## Allocation Logic

Points are assigned to users by admins via `POST /api/v1/sessions/allocate`.

### Priority order for determining points amount:
1. **Explicit override** — if the admin provides a `points` value in the request body, use that.
2. **Grade level default** — if no explicit points are given, use `user.gradeLevel.defaultPoints`.
3. **Fallback** — if the user has no grade level, allocate `0` points.

```ts
// From session.service.ts
const pointsToAssign = data.points ?? user.gradeLevel?.defaultPoints ?? 0;
```

### Upsert behaviour
Allocation uses `upsert` — if a record already exists, **both `allocatedPoints` and `remainingPoints` are reset** to the new value. This is not additive; it is a full reset. This means re-allocation wipes any remaining balance.

### Auto-allocation on registration
When a new user registers:
1. The system looks for a grade level with `name` containing `"Grade A"`.
2. It looks for the currently active session.
3. If both exist, a `UserSessionPoints` record is created immediately with `allocatedPoints = remainingPoints = gradeLevel.defaultPoints`.

---

## Deduction Logic

Points are deducted during checkout **inside a Prisma transaction**.

```ts
// From order.service.ts
await tx.userSessionPoints.update({
  where: { id: userPoints.id },
  data: {
    remainingPoints: { decrement: totalPointsRequired },
  },
});
```

Only `remainingPoints` is decremented — `allocatedPoints` is never changed after allocation, serving as an audit trail of what was originally given.

**Pre-condition check** (before the transaction starts):
```ts
if (!userPoints || userPoints.remainingPoints < totalPointsRequired) {
  throw AppError.badRequest(
    `Insufficient points. You have ${userPoints?.remainingPoints ?? 0} PT but need ${totalPointsRequired} PT.`
  );
}
```

---

## Expiration Logic

Sessions have an `endDate`. When the end date passes, the session becomes inactive.

**Automatic expiration** is handled by `SessionService.handleExpirations()`:
```ts
await prisma.session.updateMany({
  where: {
    isActive: true,
    endDate: { lt: now },
  },
  data: { isActive: false },
});
```

This method is designed to be called by a **cron job**. It is not yet wired to a scheduler in the current codebase — this is a known gap.

**Effect of expiration on points:**
- The `UserSessionPoints` records are NOT deleted. Historical data is preserved.
- Users can no longer check out because checkout requires an active session.
- Admins can still view point balances for reporting purposes.

---

## Session Switching

Admins can manually switch the active session via `PATCH /api/v1/sessions/:id/activate`.

This is also transactional:
```ts
await prisma.$transaction(async (tx) => {
  // Step 1: Deactivate ALL currently active sessions
  await tx.session.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Step 2: Activate the target session
  return tx.session.update({
    where: { id },
    data: { isActive: true },
  });
});
```

When a new session is activated, users' point balances for that session become the operative ones. If a user has no `UserSessionPoints` record for the newly active session, their effective balance is `0` — the system returns `{ remainingPoints: 0, allocatedPoints: 0 }`.

---

## Checkout Validation Flow

The complete sequence before any data is mutated:

```
1. Fetch user's cart items
         ↓
2. Check cart is not empty
         ↓
3. Fetch the currently active session
         ↓
4. Check an active session exists
         ↓
5. For each cart item:
   a. Check product.sessionId === activeSession.id
   b. Check product.stockQuantity >= item.quantity
   c. Accumulate totalPointsRequired
         ↓
6. Fetch UserSessionPoints for (userId, activeSession.id)
         ↓
7. Check remainingPoints >= totalPointsRequired
         ↓
8. BEGIN TRANSACTION
   a. Deduct remainingPoints
   b. Create Order (status: PENDING)
   c. Create OrderItems (capturing pointsPrice snapshot)
   d. Decrement stockQuantity for each product
   e. Delete all cart items for user
9. COMMIT TRANSACTION
         ↓
10. Return the created Order
```

If any step fails, the entire transaction is rolled back and the user's points are unchanged.

---

## Race Condition Prevention

The checkout transaction uses Prisma's `$transaction` API, which wraps all mutations in a single database transaction. This means:

- If two checkout requests arrive simultaneously for the same user, the second transaction will see the updated `remainingPoints` from the first and either succeed with the reduced balance or fail with insufficient points.
- PostgreSQL's ACID guarantees ensure the `remainingPoints` decrement is atomic — no partial updates.

**Known limitation:** The pre-transaction balance check (step 7 above) is performed *outside* the transaction. There is a theoretical TOCTOU (time-of-check to time-of-use) window between the check and the transaction. A future improvement would be to move the balance check inside the transaction and use `SELECT FOR UPDATE` or rely on a DB constraint to enforce `remainingPoints >= 0`.

---

## User Points Query

Users can check their own points balance via `GET /api/v1/sessions/my-points`.

```ts
// session.service.ts → getUserPoints()
// If no sessionId is provided, defaults to the active session
const points = await prisma.userSessionPoints.findUnique({
  where: {
    userId_sessionId: { userId, sessionId: targetSessionId },
  },
  include: { session: true },
});
```

If the user has no allocation for the session, the response is:
```json
{
  "remainingPoints": 0,
  "allocatedPoints": 0,
  "sessionName": "None"
}
```
