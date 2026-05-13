# Backend Standards

Standards for writing and extending the `apps/backend` codebase.

---

## Controller / Service Pattern

**Rule: Controllers are thin. Business logic lives in services.**

### Controllers
- Parse request parameters (`req.body`, `req.params`, `req.query`, `req.user`)
- Call the corresponding service method
- Return the response via `sendSuccess`, `sendCreated`, or `sendError`
- Wrap in `asyncHandler` so thrown errors propagate to the error middleware

```ts
// ✅ Good controller
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.checkout(req.user!.id);
  return sendCreated(res, order, 'Order placed successfully');
});

// ❌ Bad controller — business logic in controller
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const cartItems = await prisma.cartItem.findMany({ where: { userId: req.user!.id } });
  // ... 50 lines of logic
});
```

### Services
- Own all business logic, validations, and database queries
- Throw `AppError` for expected failures
- Use Prisma transactions for any multi-step mutations
- Return plain data objects (no `Response` objects)

---

## Validation Approach

**Rule: All request bodies, query strings, and route params must be validated with Zod before reaching the controller.**

Validators live in `src/validators/`. Each module has its own validator file.

```ts
// src/validators/auth.validator.ts
export const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  firstName: z.string().min(1).max(50).trim(),
  lastName:  z.string().min(1).max(50).trim(),
  phone:     z.string().optional(),
});
```

Apply validation via the `validate` middleware:
```ts
// Body validation (default)
router.post('/register', validate(registerSchema), authController.register);

// Query string validation
router.get('/history', validate(orderFilterSchema, 'query'), orderController.getOrderHistory);

// Route params validation
router.get('/:id', validate(idParamSchema, 'params'), productController.getProduct);
```

When validation fails, Zod errors are caught by the error middleware and returned as a structured `422 Unprocessable Entity` response.

---

## Error Handling

All errors flow through the centralised `errorHandler` middleware in `src/middleware/error.middleware.ts`.

### Throwing errors in services
Use the `AppError` factory class:

```ts
// Not found
throw AppError.notFound('Product');          // 404

// Bad request
throw AppError.badRequest('Cart is empty');  // 400

// Unauthorized
throw AppError.unauthorized('Invalid token'); // 401

// Forbidden
throw AppError.forbidden('Access denied');   // 403

// Conflict
throw AppError.conflict('Email already exists'); // 409
```

### Error middleware handles
- `ZodError` → `422` with field-level error details
- `AppError` (operational) → status code and message from the error
- Prisma errors → duck-typed by checking `err.code` (`P2002` → 409, `P2025` → 404)
- Prisma validation errors → 400
- Unknown errors → `500` (message hidden in production)

### Never swallow errors
```ts
// ✅ Let the error middleware handle it
const user = await prisma.user.findUnique(...);
if (!user) throw AppError.notFound('User');

// ❌ Don't try/catch and swallow
try {
  const user = await prisma.user.findUnique(...);
} catch (e) {
  return res.status(500).json({ error: 'something went wrong' });
}
```

---

## API Response Format

All responses use the standard `ApiResponse<T>` shape:

```ts
// Success
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],
  "meta": {             // Optional, for paginated responses
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {           // Optional, for field-level validation errors
    "email": ["Invalid email address"],
    "password": ["Must contain at least one uppercase letter"]
  }
}
```

Use the response helpers from `src/utils/apiResponse.ts`:
```ts
sendSuccess(res, data, 'Message', 200, meta);  // 200 with optional meta
sendCreated(res, data, 'Created successfully'); // 201
sendError(res, 'Message', 400, errors);         // Error response
sendNoContent(res);                             // 204 No Content
```

---

## Authentication

- **Hashing**: `bcryptjs` with `BCRYPT_SALT_ROUNDS` (default: 12) from env
- **Tokens**: Two JWTs per session — access token (15 min) and refresh token (7 days)
- **Token storage**: Refresh tokens are persisted in the `tokens` table for revocation support
- **Token rotation**: On refresh, the old refresh token is deleted and a new one is issued
- **Logout**: Deletes the specific refresh token; `logout-all` deletes all refresh tokens for the user

See [auth-system.md](./auth-system.md) for the full flow.

---

## Authorization

Role-based access uses two middleware functions from `src/middleware/auth.middleware.ts`:

```ts
// Verify JWT and attach req.user
export const authenticate = asyncHandler(...);

// Check role(s)
export const authorize = (...allowedRoles: Role[]) => ...;
```

Usage pattern:
```ts
// Require authentication
router.use(authenticate);

// Require specific role(s)
router.use(authorize(Role.ADMIN, Role.SUPER_ADMIN));

// Or per-route
router.delete('/:id', authenticate, authorize(Role.ADMIN), controller.delete);
```

`req.user` is typed as:
```ts
{
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
}
```

---

## Database Access

- **Use Prisma only.** No raw SQL queries except via `prisma.$queryRaw` if absolutely necessary.
- **Use transactions for all multi-step mutations.** If two or more tables are mutated together, wrap them in `prisma.$transaction(async (tx) => { ... })`.
- **Use `tx` (the transaction client) inside transactions**, not the global `prisma` instance.
- **Use `select` to limit returned fields** wherever possible — never return password hashes.

```ts
// ✅ Good — uses select and transaction
return prisma.$transaction(async (tx) => {
  await tx.userSessionPoints.update({ ... });
  const order = await tx.order.create({ ... });
  await tx.cartItem.deleteMany({ ... });
  return order;
});

// ❌ Bad — returns password, no transaction
const user = await prisma.user.findUnique({ where: { id } });
return user; // Includes password hash!
```

---

## File Upload Strategy

The upload middleware (`src/middleware/upload.middleware.ts`) uses `multer` and is already wired to the product create/update routes:

```ts
router.post('/', upload.single('image'), validate(createProductSchema), controller.createProduct);
```

The `upload.service.ts` in `src/services/` is currently a **stub** — it accepts the file but does not persist it anywhere. Future implementation should:
1. Upload to Supabase Storage or Cloudinary
2. Return a public URL
3. Store the URL in `product.image`

Do not store binary files in the database or on the server filesystem in production.

---

## Path Aliases

Use TypeScript path aliases instead of deep relative imports:

```ts
// ✅ Good
import { prisma } from '@config/database';
import { AppError } from '@utils/AppError';
import { authenticate } from '@middleware/auth.middleware';

// ❌ Bad
import { prisma } from '../../../config/database';
```

Configured in `tsconfig.json` under `paths`:
- `@/*` → `src/*`
- `@config/*` → `src/config/*`
- `@controllers/*` → `src/controllers/*`
- `@services/*` → `src/services/*`
- `@middleware/*` → `src/middleware/*`
- `@utils/*` → `src/utils/*`
- `@validators/*` → `src/validators/*`
- `@types/*` → `src/types/*`
- `@modules/*` → `src/modules/*`
