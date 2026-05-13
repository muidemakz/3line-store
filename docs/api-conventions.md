# API Conventions

All endpoints follow consistent conventions. This document is the reference for both backend developers building new endpoints and frontend developers consuming them.

---

## Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https://<your-backend-domain>/api/v1
```

## Health Check

```
GET /api/v1/health
```

No authentication required. Returns:
```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "status": "healthy",
    "timestamp": "2025-05-12T10:00:00.000Z",
    "uptime": "3600s",
    "environment": "production"
  }
}
```

---

## RESTful Endpoint Naming

| Pattern | Example | Meaning |
|---|---|---|
| `GET /resources` | `GET /products` | List all (paginated) |
| `GET /resources/:id` | `GET /products/:id` | Get one by ID |
| `POST /resources` | `POST /products` | Create new |
| `PATCH /resources/:id` | `PATCH /products/:id` | Partial update |
| `DELETE /resources/:id` | `DELETE /products/:id` | Delete |
| `POST /resources/:id/action` | `POST /suggestions/:id/vote` | Sub-action on a resource |
| `GET /resources/my-x` | `GET /sessions/my-points` | Current user's related data |

Avoid verbs in URLs — use HTTP methods instead.

---

## HTTP Methods

| Method | Usage | Request Body | Success Status |
|---|---|---|---|
| `GET` | Retrieve data | None | `200 OK` |
| `POST` | Create resource or trigger action | JSON | `201 Created` or `200 OK` |
| `PATCH` | Partial update | JSON | `200 OK` |
| `PUT` | Full replacement (not used) | JSON | `200 OK` |
| `DELETE` | Delete resource | None | `204 No Content` |

---

## Authentication Header

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

The access token is returned from `POST /auth/login` and `POST /auth/refresh`.

Tokens expire in **15 minutes**. Use the refresh token to obtain a new access token before expiry.

---

## Full API Route Reference

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | None | Register new user |
| `POST` | `/login` | None | Login, returns tokens |
| `POST` | `/refresh` | None | Rotate tokens using refreshToken |
| `POST` | `/logout` | None (token optional) | Invalidate refresh token |
| `POST` | `/logout-all` | Required | Invalidate all refresh tokens |
| `GET` | `/me` | Required | Get current user profile |

### Users (`/api/v1/users`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | Required | ADMIN | List all users |

### Products (`/api/v1/products`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | Required | Any | List products (filterable) |
| `GET` | `/:id` | Required | Any | Get product by ID |
| `POST` | `/` | Required | ADMIN | Create product (with image) |
| `PATCH` | `/:id` | Required | ADMIN | Update product |
| `DELETE` | `/:id` | Required | ADMIN | Delete product |

### Sessions (`/api/v1/sessions`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/my-points` | Required | Any | Get current user's points balance |
| `GET` | `/` | Required | ADMIN | List all sessions |
| `POST` | `/` | Required | ADMIN | Create new session |
| `PATCH` | `/:id/activate` | Required | ADMIN | Activate a session |
| `POST` | `/allocate` | Required | ADMIN | Allocate points to users |

### Orders (`/api/v1/orders`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/cart` | Required | Any | Get current user's cart |
| `POST` | `/cart` | Required | Any | Add/update item in cart |
| `POST` | `/checkout` | Required | Any | Checkout (transactional) |
| `GET` | `/history` | Required | Any | Get order history (paginated) |
| `GET` | `/admin/shopping-list` | Required | ADMIN | Aggregated procurement list |

### Suggestions (`/api/v1/suggestions`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | Required | Any | List suggestions (filterable) |
| `GET` | `/ranking` | Required | Any | Top suggestions by vote count |
| `POST` | `/` | Required | Any | Create suggestion |
| `POST` | `/:id/vote` | Required | Any | Vote on a suggestion |
| `DELETE` | `/:id` | Required | Any | Delete own suggestion |
| `GET` | `/:id/voters` | Required | ADMIN | List voters for a suggestion |

---

## Pagination

Paginated endpoints accept query parameters:

```
GET /api/v1/orders/history?page=2&limit=10
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 20 | Items per page |

Paginated responses include a `meta` field:
```json
{
  "success": true,
  "message": "Orders retrieved",
  "data": [...],
  "meta": {
    "total": 42,
    "page": 2,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

---

## Success Response Format

```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": { ... }
}
```

`data` may be an object, array, or `null` for actions that produce no meaningful result.

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### HTTP Status Codes Used

| Code | Meaning | When |
|---|---|---|
| `200` | OK | Successful GET / action |
| `201` | Created | Resource successfully created |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Business rule violation (empty cart, insufficient points, etc.) |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Authenticated but wrong role, or account suspended |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate (email taken, already voted, etc.) |
| `422` | Unprocessable Entity | Zod validation failure |
| `429` | Too Many Requests | Rate limit exceeded (auth endpoints) |
| `500` | Internal Server Error | Unexpected server error |

---

## Validation Error Response

When Zod validation fails, the response is `422` with field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": [
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter"
    ]
  }
}
```

Keys are dot-notation field paths (e.g., `"items.0.quantity"` for array field errors).

---

## Rate Limiting

Auth endpoints (`/register`, `/login`, `/refresh`) are rate-limited:

- Window: **15 minutes** (`RATE_LIMIT_WINDOW_MS=900000`)
- Max requests: **100** per window (`RATE_LIMIT_MAX_REQUESTS=100`)

Exceeding the limit returns `429 Too Many Requests`.
