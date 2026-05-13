# Product Overview

## What Is This?

The Palliative Shopping Platform is a **session-based, points-driven internal marketplace**. Users are awarded a fixed number of points at the start of each session and spend those points to redeem physical goods — no real money changes hands on the user side.

Think of it as an employee rewards or welfare store: the organisation decides how many points each user gets (based on their grade level), loads up products for that session, and users shop within their point budget.

---

## Core Concepts

### Sessions
A **session** is a time-bounded shopping window (e.g., "Q1 2025 Palliative"). Only one session can be active at a time. Products, points allocations, and orders all belong to a session. When a session expires or is manually deactivated, users can no longer check out.

### Points
Each user has a **points balance per session** (`UserSessionPoints`). Points are allocated by admins (or automatically on registration if a session is active). Points are spent during checkout and **cannot go negative**. Unused points do not carry over to the next session.

### Products
Products belong to a session. Each product has both a **Naira price** (for admin procurement reference) and a **points price** (what users pay). Stock is tracked — users cannot order more than what is available.

---

## Core Features

| Feature | Description |
|---|---|
| Browse Products | Users view products available in the current active session |
| Cart | Add/update items before checkout |
| Checkout | Atomic deduction of points + creation of order |
| Session Switching | Admins can switch which session is active |
| Points Balance | Users can view their remaining points for the current session |
| Suggestions | Users propose new products; community votes on them |
| Order History | Users view past orders with status tracking |
| Admin Shopping List | Aggregated view of all pending orders for procurement |

---

## User Types

### Regular Users (`USER`)
- Access the **marketplace** app only
- Browse products, manage cart, checkout with points
- Submit and vote on product suggestions
- View their own order history and points balance

### Admins (`ADMIN` / `SUPER_ADMIN`)
- Access both the **marketplace** and **admin** apps
- Create and manage sessions (start/end dates, activate/deactivate)
- Create, update, and delete products
- Allocate points to users
- View all users and their statuses
- View the global shopping list (aggregated orders for procurement)
- View suggestion voter lists

---

## The Three Applications

### 1. `apps/marketplace` — User-Facing Storefront
- React 18 + TypeScript + Vite
- Users browse products, manage their cart, and check out using points
- Currently uses mock data (`src/data/mockData.ts`); integration with the real API is the next step
- Runs on port `5173` (Vite default)

### 2. `apps/admin` — Admin Portal
- React 19 + TypeScript + Vite + Ant Design
- Full CRUD for sessions, products, and users
- Points allocation interface
- Order management and shopping list view
- Runs on port `5174` (or configured Vite port)

### 3. `apps/backend` — REST API
- Node.js + Express + TypeScript
- Prisma ORM with PostgreSQL (hosted on Supabase)
- JWT authentication, role-based access control
- Swagger/OpenAPI documentation at `/api/v1/docs`
- Health check at `/api/v1/health`
- Runs on port `5000`

---

## How the Apps Relate

```
[marketplace]  ──┐
                 ├──► [backend API :5000] ──► [Supabase PostgreSQL]
[admin portal] ──┘
```

Both frontend apps are independent Vite projects that communicate with the single shared backend. They share no code directly today, but the `packages/shared-types` package is the intended home for TypeScript types shared across all three apps.
