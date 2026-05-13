# Auth System

## Overview

Authentication uses **JWT (JSON Web Tokens)** with a two-token pattern:
- **Access token** — short-lived (15 min), sent with every API request
- **Refresh token** — long-lived (7 days), used only to obtain new access tokens

Passwords are hashed with **bcryptjs** (12 salt rounds).

---

## Registration Flow

`POST /api/v1/auth/register`

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234..."   // optional
}
```

**Password requirements (enforced by Zod):**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**What happens:**
1. Check email is not already taken → `409` if duplicate
2. Hash password with bcrypt (12 rounds)
3. Look up the first grade level with name containing `"Grade A"`
4. Look up the currently active session
5. Create the `User` record + an empty `Profile`
6. If both a grade level and active session exist, automatically create a `UserSessionPoints` record with `allocatedPoints = remainingPoints = gradeLevel.defaultPoints`
7. Generate access + refresh tokens
8. Persist the refresh token in the `tokens` table (expires in 7 days)
9. Return user data + tokens

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

---

## Login Flow

`POST /api/v1/auth/login`

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**What happens:**
1. Find user by email
2. Compare password with stored hash using bcrypt
3. If either email or password is wrong → `401 Invalid email or password` (generic message prevents user enumeration)
4. Check user status — `SUSPENDED` or `INACTIVE` → `403`
5. Update `lastLoginAt` timestamp
6. Generate new access + refresh tokens
7. Persist new refresh token in `tokens` table
8. Return user data + tokens (password field excluded)

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

---

## Token Refresh Mechanism

`POST /api/v1/auth/refresh`

**Request body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**What happens:**
1. Verify the refresh token signature with `JWT_REFRESH_SECRET`
2. Look up the token in the `tokens` table
3. If not found or expired → `401 Refresh token is invalid or expired`
4. **Token rotation:** delete the old refresh token
5. Generate a new access + refresh token pair
6. Persist the new refresh token
7. Return new tokens

This implements **refresh token rotation** — each use of a refresh token produces a new one, and the old one becomes invalid immediately.

---

## Logout

**Single device:** `POST /api/v1/auth/logout`
```json
{ "refreshToken": "eyJ..." }
```
Deletes the specific refresh token. The access token will naturally expire after 15 minutes.

**All devices:** `POST /api/v1/auth/logout-all` (requires authentication)

Deletes all refresh tokens for the current user — effectively signing out all active sessions.

---

## Role-Based Access Control

Three roles are defined in the `Role` enum:

| Role | Description |
|---|---|
| `USER` | Regular user — marketplace access only |
| `ADMIN` | Admin — full platform access |
| `SUPER_ADMIN` | Elevated admin — same permissions as ADMIN (future differentiation planned) |

Role is embedded in the JWT payload and also stored in the database. The `authenticate` middleware extracts it from the token. The `authorize` middleware checks it against the required roles.

```ts
// From auth.middleware.ts
req.user = {
  id: user.id,
  email: user.email,
  role: user.role,           // e.g., "ADMIN"
  isAdmin: user.role === 'ADMIN'
};
```

---

## Protected Routes

### No authentication required
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /health`

### Authentication required (any role)
- `GET /auth/me`
- `POST /auth/logout-all`
- `GET /products`
- `GET /products/:id`
- `GET /sessions/my-points`
- `GET /orders/cart`
- `POST /orders/cart`
- `POST /orders/checkout`
- `GET /orders/history`
- `GET /suggestions`
- `GET /suggestions/ranking`
- `POST /suggestions`
- `POST /suggestions/:id/vote`
- `DELETE /suggestions/:id`

### Admin-only (`ADMIN` or `SUPER_ADMIN`)
- `GET /users`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `GET /sessions`
- `POST /sessions`
- `PATCH /sessions/:id/activate`
- `POST /sessions/allocate`
- `GET /orders/admin/shopping-list`
- `GET /suggestions/:id/voters`

---

## Token Storage (Frontend Considerations)

The current implementation does not dictate where the frontend stores tokens. Two common approaches and their trade-offs:

### Option A: localStorage (current marketplace approach implied)
- Simple to implement
- **Vulnerable to XSS** — any injected script can read tokens
- Acceptable for internal-only tools with controlled environments

### Option B: HTTP-only cookies
- Not accessible to JavaScript — XSS-safe
- Requires same-domain or configured CORS with `credentials: true`
- Requires backend to set and clear cookies
- **Not yet implemented** but the architecture supports adding it

For an internal welfare platform (not public-facing), localStorage with proper XSS prevention (CSP headers, input sanitisation) is pragmatically acceptable. The backend is ready to support cookie-based auth if required.

---

## JWT Configuration

From `.env`:

```env
JWT_SECRET=<min 32 chars>
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=<min 32 chars>
JWT_REFRESH_EXPIRES_IN=7d
```

Access and refresh tokens use different secrets so a compromise of one does not affect the other.
