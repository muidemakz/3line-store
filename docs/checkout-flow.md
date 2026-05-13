# Checkout Flow

This document describes the complete checkout process from the user clicking "Checkout" to receiving their order confirmation.

---

## Overview

Checkout is a **single atomic operation** on the backend. All point deductions, order creation, and stock updates happen inside one Prisma transaction. Either everything succeeds or nothing changes.

---

## Step-by-Step Flow

### 1. Frontend: User Adds Items to Cart

The user browses products and adds items.

```
POST /api/v1/orders/cart
Authorization: Bearer <accessToken>

{
  "productId": "clxxx...",
  "quantity": 2
}
```

The backend uses `upsert` — if the item already exists in the cart, the quantity is updated. Stock is checked at this point too (you can't add more than what's in stock).

### 2. Frontend: User Reviews Cart

```
GET /api/v1/orders/cart
Authorization: Bearer <accessToken>
```

Returns all cart items with product details including `pointsPrice` and `stockQuantity`.

### 3. Frontend: User Clicks Checkout

```
POST /api/v1/orders/checkout
Authorization: Bearer <accessToken>

(no body required — cart is fetched server-side)
```

### 4. Backend: Fetch Cart

```ts
const cartItems = await prisma.cartItem.findMany({
  where: { userId },
  include: { product: true },
});
```

**Fail condition:** Cart is empty → `400 Cart is empty`

### 5. Backend: Identify Active Session

```ts
const activeSession = await prisma.session.findFirst({
  where: { isActive: true },
});
```

**Fail condition:** No active session → `400 No active session for checkout`

### 6. Backend: Validate All Cart Items

For each item in the cart:

**a. Check session match:**
```ts
if (item.product.sessionId !== activeSession.id) {
  throw AppError.badRequest(
    `Product "${item.product.title}" belongs to an inactive session.`
  );
}
```

**b. Check stock:**
```ts
if (item.product.stockQuantity < item.quantity) {
  throw AppError.badRequest(
    `Insufficient stock for "${item.product.title}".`
  );
}
```

**c. Accumulate total:**
```ts
totalPointsRequired += item.product.pointsPrice * item.quantity;
```

### 7. Backend: Check User Points

```ts
const userPoints = await prisma.userSessionPoints.findUnique({
  where: { userId_sessionId: { userId, sessionId: activeSession.id } },
});

if (!userPoints || userPoints.remainingPoints < totalPointsRequired) {
  throw AppError.badRequest(
    `Insufficient points. You have ${userPoints?.remainingPoints ?? 0} PT but need ${totalPointsRequired} PT.`
  );
}
```

**Fail condition:** Not enough points → `400` with exact message showing current balance vs required.

### 8. Backend: Begin Transaction

If all validations pass, the following happens atomically:

#### 8a. Deduct Points
```ts
await tx.userSessionPoints.update({
  where: { id: userPoints.id },
  data: { remainingPoints: { decrement: totalPointsRequired } },
});
```

Only `remainingPoints` is decremented. `allocatedPoints` is preserved as an audit record.

#### 8b. Create Order

```ts
const order = await tx.order.create({
  data: {
    userId,
    sessionId: activeSession.id,
    totalPoints: totalPointsRequired,
    status: OrderStatus.PENDING,
    orderItems: {
      create: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        pointsPrice: item.product.pointsPrice, // Snapshot price at purchase
      })),
    },
  },
  include: { orderItems: true },
});
```

The `pointsPrice` is captured from the product **at the time of purchase**. Future product price changes do not affect this order.

Order status starts as `PENDING`.

#### 8c. Decrement Stock

```ts
for (const item of cartItems) {
  await tx.product.update({
    where: { id: item.productId },
    data: { stockQuantity: { decrement: item.quantity } },
  });
}
```

#### 8d. Clear Cart

```ts
await tx.cartItem.deleteMany({ where: { userId } });
```

### 9. Backend: Commit Transaction

If all steps complete without error, Prisma commits the transaction. The created order is returned.

### 10. Frontend: Handle Success

The frontend receives the order object and should:
- Clear the local cart state
- Show a success message / confirmation screen
- Redirect to order history

**Response `201`:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": "clxxx...",
    "userId": "clyyy...",
    "sessionId": "clzzz...",
    "totalPoints": 25,
    "status": "PENDING",
    "orderItems": [
      {
        "id": "claaa...",
        "productId": "clbbb...",
        "quantity": 2,
        "pointsPrice": 10
      }
    ],
    "createdAt": "2025-05-12T10:00:00.000Z"
  }
}
```

---

## Error Scenarios & Rollback

If any error is thrown during the transaction, Prisma automatically rolls back all changes. The user's points are unchanged, no order is created, and stock quantities are not decremented.

| Scenario | HTTP Status | Message |
|---|---|---|
| Empty cart | `400` | `Cart is empty` |
| No active session | `400` | `No active session for checkout` |
| Product in wrong session | `400` | `Product "X" belongs to an inactive session.` |
| Insufficient stock | `400` | `Insufficient stock for "X".` |
| Insufficient points | `400` | `Insufficient points. You have N PT but need M PT.` |
| Database error during transaction | `500` | Generic error (transaction rolled back) |

---

## Admin: Global Shopping List

After users check out, admins can view an aggregated procurement list:

```
GET /api/v1/orders/admin/shopping-list
```

This groups all `PENDING` and `PROCESSING` order items from the active session and sums quantities by product — giving the admin a clear list of what to physically procure and fulfil.

```json
[
  {
    "productId": "clxxx...",
    "title": "Indomie - Instant Noodles Chicken",
    "totalQuantity": 47
  },
  {
    "productId": "clyyy...",
    "title": "Hollandia Milk 50G",
    "totalQuantity": 23
  }
]
```

---

## Order Lifecycle

Orders progress through these statuses (defined in the `OrderStatus` enum):

```
PENDING → PROCESSING → SHIPPED → DELIVERED
                              ↘
                            CANCELLED
```

Status transitions are currently manual (admin updates order status). Automated status progression is a planned feature.
