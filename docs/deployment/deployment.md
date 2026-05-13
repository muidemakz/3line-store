# Deployment Guide

## Architecture Summary

```
[Vercel: marketplace]  ──┐
                          ├──► [Railway/Render: backend :5000] ──► [Supabase: PostgreSQL]
[Vercel: admin]        ──┘
```

---

## Local Development Setup

See [environment-setup.md](../environment-setup.md) for the full local setup guide.

Quick start:
```bash
pnpm install
pnpm dev          # Starts all apps via Turborepo
# or individually:
pnpm marketplace:dev
pnpm admin:dev
pnpm backend:dev
```

---

## Database Setup (Supabase)

### Connection strings

The backend uses two connection strings (configured in `apps/backend/.env`):

```env
# For runtime queries — goes through PgBouncer connection pooler
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true"

# For Prisma migrations — direct connection, bypasses pooler
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

Both are required in the Prisma schema:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Running Migrations

**First time / new environment:**
```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
```

**During development (creates new migration files):**
```bash
npx prisma migrate dev --name describe-your-change
```

**View/edit data:**
```bash
npx prisma studio
```

---

## Environment Variables Per App

### `apps/backend/.env`
```env
NODE_ENV=production
PORT=5000
API_VERSION=v1

DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

JWT_SECRET=<min 32 chars, use a secure random string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<min 32 chars, different from JWT_SECRET>
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12

ALLOWED_ORIGINS=https://your-marketplace.vercel.app,https://your-admin.vercel.app

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

LOG_LEVEL=info
```

### `apps/marketplace/.env`
```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

### `apps/admin/.env`
```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

---

## Frontend Deployment (Vercel)

Deploy `marketplace` and `admin` as two separate Vercel projects.

### Marketplace

1. Connect your GitHub repository to Vercel
2. **Framework preset:** Vite
3. **Root directory:** `apps/marketplace`
4. **Build command:** `pnpm build`
5. **Output directory:** `dist`
6. **Environment variables:** Add `VITE_API_URL`

### Admin Portal

Repeat the same process with:
- **Root directory:** `apps/admin`
- **Environment variables:** Add `VITE_API_URL`

> **Important:** Vercel needs to install from the monorepo root. Set the **install command** to `pnpm install --frozen-lockfile` and ensure `turbo` is available.

### Vercel `vercel.json` (optional, for SPA routing)
Create `apps/marketplace/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
Repeat for `apps/admin`.

---

## Backend Deployment (Railway)

1. Create a new Railway project
2. Connect your GitHub repository
3. **Root directory:** `apps/backend`
4. **Build command:** `pnpm install && pnpm build`
5. **Start command:** `pnpm start` (runs `node dist/server.js`)
6. Add all environment variables from the `apps/backend/.env` list above
7. Set `NODE_ENV=production`

Railway will automatically:
- Assign a domain (e.g., `your-backend.up.railway.app`)
- Manage restarts on crash

### Render (alternative)

1. Create a new **Web Service**
2. Connect repository
3. **Build command:** `cd apps/backend && pnpm install && pnpm build`
4. **Start command:** `cd apps/backend && pnpm start`
5. Set environment variables

---

## Database Migration Strategy

| Environment | Command | Notes |
|---|---|---|
| Local dev | `npx prisma migrate dev` | Creates migration files, applies them |
| CI/CD | `npx prisma migrate deploy` | Applies existing migration files only |
| Production | `npx prisma migrate deploy` | Run before starting the server |

**Never run `prisma migrate dev` in production.** It may prompt interactively and can reset the database.

### Recommended deployment sequence
1. Run `prisma migrate deploy` in the build/release phase
2. Run `prisma generate` to ensure the Prisma client is up to date
3. Start the application with `node dist/server.js`

On Railway/Render, add to the start command:
```bash
npx prisma migrate deploy && node dist/server.js
```

---

## Production Checklist

- [ ] `NODE_ENV=production` is set on the backend
- [ ] JWT secrets are at least 32 characters and randomly generated
- [ ] `ALLOWED_ORIGINS` includes the exact Vercel domain(s), no trailing slashes
- [ ] `DIRECT_URL` is set for Prisma migrations
- [ ] `LOG_LEVEL=info` or `warn` (not `debug`)
- [ ] Database migrations have been run (`prisma migrate deploy`)
- [ ] Prisma client has been generated (`prisma generate`)
- [ ] HTTPS is enabled on all services (Vercel and Railway handle this automatically)
- [ ] Rate limiting is configured appropriately for production load
