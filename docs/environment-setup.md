# Environment Setup

Step-by-step guide to get the full monorepo running locally from scratch.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18.0.0 | https://nodejs.org or via `nvm` |
| pnpm | ≥ 8.0.0 | `npm install -g pnpm@8` |
| Git | Any recent | https://git-scm.com |
| Supabase account | — | https://supabase.com (free tier is fine) |

Verify your versions:
```bash
node --version   # Should be v18+
pnpm --version   # Should be 8+
```

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd 3line-store
```

---

## 2. Install Dependencies

Install all workspace dependencies from the monorepo root:

```bash
pnpm install
```

This installs packages for all apps (`marketplace`, `admin`, `backend`) in one pass. Turborepo handles dependency resolution across workspaces.

---

## 3. Set Up Supabase

1. Log in at https://supabase.com
2. Create a new project (note the project ref, e.g., `mgmkjooahfujtxhljtql`)
3. Go to **Settings → Database → Connection string**
4. Copy both the **Pooler (Transaction mode)** URL and the **Direct connection** URL

---

## 4. Set Up Environment Variables

### Backend

Copy the example file:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` and fill in:
```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

# From Supabase — Pooler URL (Transaction mode, port 5432)
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true"

# From Supabase — Direct connection URL
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"

# Generate secure random strings (at least 32 chars each)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_different_from_above
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

LOG_LEVEL=debug
```

### Marketplace

Create `apps/marketplace/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Admin Portal

Create `apps/admin/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 5. Run Database Migrations

From the backend directory, apply the Prisma schema to your Supabase database:

```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
cd ../..
```

Alternatively, if you want to create a fresh migration during development:
```bash
cd apps/backend
npx prisma migrate dev --name init
cd ../..
```

Verify the tables were created by opening Prisma Studio:
```bash
cd apps/backend
npx prisma studio
```
This opens a browser UI at `http://localhost:5555` where you can browse your database tables.

---

## 6. Seed Initial Data (Optional but Recommended)

The backend includes a seed script. Run it to populate grade levels and an initial admin user:

```bash
cd apps/backend
npx prisma db seed
```

If the seed fails or doesn't exist yet, you can manually create a grade level and admin user via Prisma Studio or by calling the register endpoint and updating the role directly in the database.

---

## 7. Start Development Servers

### All apps together (recommended)

From the monorepo root:
```bash
pnpm dev
```

Turborepo starts all three apps in parallel.

### Individual apps

```bash
pnpm marketplace:dev   # http://localhost:5173
pnpm admin:dev         # http://localhost:5174
pnpm backend:dev       # http://localhost:5000
```

Or navigate to each directory and run `pnpm dev`:
```bash
cd apps/backend && pnpm dev
```

The backend uses `nodemon` with `ts-node` for hot-reload on file changes.

---

## 8. Verify Setup

### Backend health check
```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "status": "healthy",
    "timestamp": "...",
    "uptime": "...",
    "environment": "development"
  }
}
```

### Register a test user
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Swagger API docs
Open http://localhost:5000/api/v1/docs in your browser for the interactive API documentation.

### Frontend
- Marketplace: http://localhost:5173
- Admin portal: http://localhost:5174

---

## Troubleshooting

### `Cannot connect to database`
- Verify `DATABASE_URL` and `DIRECT_URL` are correct in `apps/backend/.env`
- Check Supabase project is not paused (free tier pauses after inactivity)
- Ensure your IP is not blocked in Supabase network settings

### `Prisma client not generated`
```bash
cd apps/backend && npx prisma generate
```

### `pnpm: command not found`
```bash
npm install -g pnpm@8
```

### `Port 5000 already in use`
Change `PORT` in `apps/backend/.env` to another port (e.g., `5001`) and update `VITE_API_URL` in both frontend `.env` files.

### TypeScript errors on startup
```bash
cd apps/backend && pnpm type-check
```
This runs `tsc --noEmit` to show all TypeScript errors without building.
