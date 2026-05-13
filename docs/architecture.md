# Architecture

## Monorepo Structure

```
3line-store/
├── apps/
│   ├── marketplace/          # User-facing React storefront
│   ├── admin/                # Admin React portal
│   └── backend/              # Express REST API
├── packages/
│   ├── shared-types/         # Shared TypeScript types (planned)
│   ├── ui/                   # Shared UI components (planned)
│   └── eslint-config/        # Shared ESLint config (planned)
├── docs/                     # This documentation
├── turbo.json                # Turborepo pipeline config
├── pnpm-workspace.yaml       # pnpm workspace definition
└── package.json              # Root monorepo package (palliative-monorepo)
```

Managed with **Turborepo** for task orchestration and **pnpm workspaces** for package linking.

---

## Tech Stack Per App

### `apps/marketplace`
| Concern | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build tool | Vite 6 |
| Routing | React Router DOM v6 |
| State | Local component state (no global store yet) |
| Styling | CSS / Tailwind (TBD) |
| Data | Currently mock data (`src/data/mockData.ts`) |

### `apps/admin`
| Concern | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite 8 |
| Routing | React Router DOM v7 |
| UI library | Ant Design v6 |
| State | Zustand |
| Data fetching | TanStack Query (React Query v5) |
| HTTP client | Axios |
| Notifications | React Toastify |

### `apps/backend`
| Concern | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Logging | Winston + Morgan |
| API Docs | Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express) |
| File uploads | Multer |
| Security | Helmet, CORS, express-rate-limit |
| Path aliases | tsconfig-paths |

---

## Database Schema Overview

12 tables in PostgreSQL, managed by Prisma:

```
grade_levels
    └── users (gradeLevelId → grade_levels.id)
            ├── tokens
            ├── profiles
            ├── user_session_points (userId + sessionId → unique)
            ├── cart_items (userId + productId → unique)
            ├── orders
            │       └── order_items
            ├── suggestions
            │       └── suggestion_votes (userId + suggestionId → unique)
            └── (via orders) sessions
                    ├── user_session_points
                    ├── products
                    │       ├── cart_items
                    │       └── order_items
                    ├── orders
                    └── suggestions
```

### Key relationships
- A **User** belongs to a **GradeLevel** (optional)
- A **Session** has many **Products**, **Orders**, **UserSessionPoints**, and **Suggestions**
- **UserSessionPoints** is the join table between User and Session, storing the points balance
- **Order** belongs to a User and a Session; has many **OrderItems**
- **CartItem** is the per-user shopping cart (userId + productId unique constraint)
- **SuggestionVote** prevents double-voting (userId + suggestionId unique constraint)

---

## API Architecture

Base URL: `http://localhost:5000/api/v1`

| Prefix | Module | Auth Required |
|---|---|---|
| `/health` | Health check | None |
| `/auth` | Registration, login, token refresh | Mixed |
| `/users` | User management | Admin only |
| `/products` | Product CRUD + listing | All authenticated |
| `/sessions` | Session CRUD + points allocation | Mixed (User/Admin) |
| `/orders` | Cart, checkout, order history | All authenticated |
| `/suggestions` | Suggestions + voting | All authenticated |

All routes follow REST conventions. See [api-conventions.md](./api-conventions.md) for details.

---

## Shared Types Package

`packages/shared-types` is intended to house TypeScript interfaces shared across all three apps:

```
packages/shared-types/
├── package.json              # name: "@palliative/shared-types"
├── index.ts                  # Re-exports everything
└── types/                    # Individual type files
```

Currently a scaffold. Types to be moved from `apps/backend/src/types/index.ts` and the marketplace's `src/types/` into here as the integration matures.

---

## Deployment Strategy

### Frontend Apps (Vercel)
Both `marketplace` and `admin` deploy to Vercel as separate projects.

- **Root directory**: `apps/marketplace` or `apps/admin`
- **Build command**: `pnpm build` (or `turbo run build --filter=marketplace`)
- **Output directory**: `dist`
- **Environment variables**: Set `VITE_API_URL` to the production backend URL

### Backend (Railway or Render)
- **Start command**: `pnpm start` → `node dist/server.js`
- **Build command**: `pnpm build` → `tsc`
- Set all environment variables from `.env.example`

### Database (Supabase)
- PostgreSQL hosted on Supabase
- Uses both a **pooler URL** (`DATABASE_URL` via PgBouncer) and a **direct URL** (`DIRECT_URL`) for Prisma migrations
- Run migrations via: `npx prisma migrate deploy`

```
[Vercel: marketplace] ─────┐
                            ├──► [Railway/Render: backend] ──► [Supabase: PostgreSQL]
[Vercel: admin]       ─────┘
```
