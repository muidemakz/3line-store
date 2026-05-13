# Roadmap

## Current Features (Implemented)

### Backend API
- [x] User registration and login with JWT authentication
- [x] Refresh token rotation with revocation support
- [x] Logout (single device) and logout-all (all devices)
- [x] Role-based access control (`USER`, `ADMIN`, `SUPER_ADMIN`)
- [x] Session management (create, list, activate, expire)
- [x] Points allocation per user per session (with grade level defaults)
- [x] Auto-allocation of points on user registration
- [x] Product CRUD (admin only) with image upload middleware
- [x] Product listing for authenticated users
- [x] Cart management (add, update, view)
- [x] Atomic transactional checkout (points deduction + order creation + stock decrement)
- [x] Order history with pagination and status filtering
- [x] Admin global shopping list (aggregated procurement view)
- [x] Community suggestions (create, list, ranked listing)
- [x] Suggestion voting (one vote per user, duplicate prevention)
- [x] Admin view of suggestion voters
- [x] Centralised error handling with Zod validation errors
- [x] Winston request logging
- [x] Rate limiting on auth endpoints
- [x] Swagger/OpenAPI documentation
- [x] Health check endpoint
- [x] Prisma schema with full relational model (12 tables)
- [x] Supabase PostgreSQL integration (pooler + direct URL)

### Admin Portal (`apps/admin`)
- [x] Dashboard shell with routing
- [x] Ant Design component library integrated
- [x] Zustand state management
- [x] TanStack Query for data fetching
- [x] Axios HTTP client configured

### Marketplace (`apps/marketplace`)
- [x] Product browsing UI with mock data
- [x] Session display with mock data
- [x] Cart UI
- [x] Basic routing

### Infrastructure
- [x] Turborepo monorepo with pnpm workspaces
- [x] Shared packages scaffold (`shared-types`, `ui`, `eslint-config`)
- [x] TypeScript path aliases on backend

---

## Planned Features (Not Yet Implemented)

### High Priority

#### Marketplace — API Integration
- [ ] Replace mock data with real API calls using `VITE_API_URL`
- [ ] Auth flow (login/register screens, token storage, protected routes)
- [ ] Live cart synced to backend
- [ ] Real checkout connected to backend
- [ ] Points balance display from API
- [ ] Order history page connected to API

#### Admin Portal — Core Features
- [ ] Login screen and authentication flow
- [ ] Session management UI (create, activate, view)
- [ ] Product management UI (create, edit, delete, image upload)
- [ ] User management UI (list users, view status)
- [ ] Points allocation UI (select users, set points per session)
- [ ] Order management (view all orders, update status)
- [ ] Global shopping list view

#### Backend
- [ ] Order status update endpoint (`PATCH /orders/:id/status`)
- [ ] Cron job for automatic session expiration (`handleExpirations()` is implemented but not scheduled)
- [ ] File upload implementation — currently a stub; needs Supabase Storage or Cloudinary integration
- [ ] User profile endpoints (view/update profile, avatar)
- [ ] Grade level CRUD endpoints (currently managed only via DB)

### Medium Priority

#### Notifications
- [ ] Email notification on successful checkout
- [ ] Email notification when order status changes
- [ ] Nodemailer or Resend integration

#### Admin Analytics Dashboard
- [ ] Total points allocated vs spent per session
- [ ] Most popular products
- [ ] User activity overview
- [ ] Session comparison charts

#### Shared Types Package
- [ ] Extract shared TypeScript interfaces into `packages/shared-types`
- [ ] Import `@palliative/shared-types` in both frontend apps and backend

#### Security Improvements
- [ ] Move from localStorage to HTTP-only cookies for token storage
- [ ] Add CSRF protection
- [ ] Add email verification flow (validator schemas already exist)
- [ ] Implement password reset flow (validator schemas already exist)
- [ ] Add request signing or API key for admin-only operations

### Low Priority / Future

- [ ] Mobile-responsive marketplace redesign
- [ ] Push notifications (browser notifications for order updates)
- [ ] Suggestion comment threads
- [ ] Admin bulk import of users via CSV
- [ ] Multi-language support (i18n)
- [ ] Dark mode

---

## Known Issues & Technical Debt

### Critical
- **Race condition in checkout:** The balance check (`remainingPoints >= total`) happens outside the transaction. Two simultaneous checkouts from the same user could theoretically both pass the check and then both deduct, resulting in a negative balance. Fix: move the check inside the transaction or add a `CHECK (remainingPoints >= 0)` constraint to the database.

### High
- **Session expiration cron is not wired:** `sessionService.handleExpirations()` exists and is correct, but nothing calls it on a schedule. Sessions will remain `isActive: true` past their `endDate` until manually deactivated. Fix: add a cron job using `node-cron` or a platform-level scheduled task.

- **File upload is a stub:** `src/services/upload.service.ts` exists but doesn't persist files anywhere. Product images cannot be uploaded until this is implemented.

- **Marketplace uses mock data:** `apps/marketplace/src/data/mockData.ts` is entirely static. The marketplace is not yet connected to the backend API.

### Medium
- **No order status update endpoint:** Orders can be created but their status cannot be updated via the API. Admins cannot mark orders as `PROCESSING`, `SHIPPED`, or `DELIVERED`.

- **`SUPER_ADMIN` has no exclusive permissions:** The role exists in the enum and is accepted by `authorize()`, but there are no features that differentiate it from `ADMIN`.

- **Grade level management has no API:** Grade levels can only be created or modified directly via the database (Prisma Studio). There is no admin UI or API endpoint for managing grade levels.

- **No input sanitisation beyond Zod:** While Zod validates types and formats, there is no explicit HTML sanitisation for text fields like `suggestion.title` or `product.description`. Consider adding `sanitize-html` for any fields that might be rendered as HTML.

### Low
- **`user.service.ts` is missing:** `user.routes.ts` imports `user.controller.ts`, but there is no `user.service.ts` — the controller may be calling Prisma directly, which deviates from the controller/service pattern.
- **Swagger docs are partially complete:** Some routes have `@openapi` JSDoc comments; others do not. The docs are incomplete.
- **`migration.sql` in repo root of backend:** This file is in UTF-16 encoding and seems to be a manual export. It should either be removed or converted to a proper Prisma migration.
