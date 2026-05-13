# Business Rules

These rules define how the system MUST behave. Any code that contradicts these rules is a bug.

---

## Session Rules

1. **Only one active session at a time.** Activating a session automatically deactivates all others (transactionally).
2. **Sessions have a start date and an end date.** End date must be after start date — enforced at creation.
3. **Expiration is time-based.** When a session's `endDate` passes, it is automatically set to `isActive: false` by the `handleExpirations()` job.
4. **Users cannot check out against an inactive session.** If no session is active, checkout is rejected with `400 No active session for checkout`.
5. **Products belong to a specific session.** A cart item whose product's `sessionId` differs from the currently active session will cause checkout to fail.
6. **Sessions can be switched manually by admins** via `PATCH /api/v1/sessions/:id/activate`.

---

## Points Rules

1. **Points are per-user, per-session.** The `UserSessionPoints` table is the source of truth. `allocatedPoints` = what was given. `remainingPoints` = what is left.
2. **Points cannot go negative.** Before checkout, the system verifies `remainingPoints >= totalPointsRequired`. If not, checkout is rejected.
3. **Points are allocated by admins** via `POST /api/v1/sessions/allocate`. Admins can target specific users.
4. **Default points come from the user's grade level.** When allocating, if no explicit points value is provided, `user.gradeLevel.defaultPoints` is used. If the user has no grade level, 0 points are allocated.
5. **New users receive points automatically on registration** if a session is active and a "Grade A" grade level exists — points are set to `gradeLevel.defaultPoints`.
6. **Re-allocation resets both `allocatedPoints` and `remainingPoints`** to the new value. This is intentional (not additive).
7. **Points do not carry over between sessions.** Each session has its own `UserSessionPoints` record. A user's balance in Session A is independent of their balance in Session B.
8. **Expired/inactive sessions make points inaccessible.** Points exist in the database but checkout will fail because no active session matches.

---

## Product Rules

1. **Every product belongs to a session** (`sessionId` is required, non-nullable).
2. **Products have two prices:** `nairaPrice` (Decimal, for admin procurement reference) and `pointsPrice` (Integer, what users pay).
3. **Stock is tracked.** `stockQuantity` decrements on every successful checkout. It can reach 0 but not below.
4. **Insufficient stock blocks checkout.** If `product.stockQuantity < quantity requested`, checkout fails with a descriptive error.
5. **Only admins can create, update, or delete products.** Users can only read them.
6. **Products support image uploads** (via `upload.single('image')` middleware), though the upload service is currently a stub.

---

## Checkout Rules

1. **Cart must not be empty.** An empty cart checkout returns `400 Cart is empty`.
2. **An active session must exist.** No active session → `400 No active session for checkout`.
3. **All cart items must belong to the active session.** Mixed-session carts are rejected per-item.
4. **Stock must be sufficient for every item.**
5. **User must have enough points in the active session.**
6. **All mutations happen in a single Prisma transaction:**
   - Deduct `remainingPoints` from `UserSessionPoints`
   - Create `Order` with status `PENDING`
   - Create `OrderItem` records (capturing `pointsPrice` at time of purchase)
   - Decrement `stockQuantity` for each product
   - Delete all cart items for the user
7. **If the transaction fails for any reason, all changes are rolled back.**
8. **`pointsPrice` is captured at time of purchase** in `OrderItem`. Future price changes do not affect existing orders.

---

## Voting Rules

1. **One vote per user per suggestion.** Enforced by a unique constraint on `(userId, suggestionId)` in `suggestion_votes`. Attempting to vote twice returns a `409 Conflict` (duplicate key).
2. **`voteCount` on the `Suggestion` model** is the denormalised tally — it must be incremented atomically when a vote is cast.
3. **Any authenticated user can vote.** No role restriction.
4. **Suggestions are ranked by `voteCount`** via `GET /api/v1/suggestions/ranking`.
5. **Admin-only:** viewing the list of voters for a suggestion (`GET /api/v1/suggestions/:id/voters`).
6. **Users can delete their own suggestions** (subject to ownership check in service layer).

---

## Role Rules

| Action | USER | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|
| Browse products | ✅ | ✅ | ✅ |
| Add to cart / checkout | ✅ | ✅ | ✅ |
| View own order history | ✅ | ✅ | ✅ |
| Submit suggestions / vote | ✅ | ✅ | ✅ |
| Create / edit / delete products | ❌ | ✅ | ✅ |
| Create sessions | ❌ | ✅ | ✅ |
| Activate sessions | ❌ | ✅ | ✅ |
| Allocate points | ❌ | ✅ | ✅ |
| List all users | ❌ | ✅ | ✅ |
| View global shopping list | ❌ | ✅ | ✅ |
| View suggestion voters | ❌ | ✅ | ✅ |

`SUPER_ADMIN` has all `ADMIN` permissions. There is currently no action exclusively for `SUPER_ADMIN`.

---

## Grade Level Rules

1. **Grade levels define the default points per session.** Example: "Grade A" → 300 points.
2. **Users are assigned a grade level at registration** (defaults to the first "Grade A" level found).
3. **Grade level determines allocation amount** when no explicit points value is given during `POST /api/v1/sessions/allocate`.
4. **Changing a user's grade level does not retroactively change already-allocated points.** Only future allocations are affected.
