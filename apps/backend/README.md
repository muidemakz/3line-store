# Palliative Care Backend API

A production-ready, scalable REST API built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (Access + Refresh Token rotation)
- **Validation**: Zod
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, Express-Rate-Limit, Bcrypt

## 📂 Project Structure

```text
src/
├── config/             # App configuration & environment variables
├── middleware/         # Express middlewares (auth, error, logging, etc.)
├── modules/            # Feature-based modules (Auth, Users, etc.)
│   └── auth/           # Auth controllers, services, and routes
├── routes/             # Root and versioned API routing
├── types/              # TypeScript interfaces and type definitions
├── utils/              # Utility functions and helper classes
└── validators/         # Global Zod validation schemas
prisma/                 # Database schema and migration files
```

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js installed
- Docker (for local PostgreSQL) or a running PostgreSQL instance

### 2. Environment Setup
Copy `.env.example` to `.env` and update your database credentials.
```bash
cp .env.example .env
```

### 3. Start Database (Optional)
If you have Docker installed, you can spin up the database using:
```bash
docker-compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Database Initialization
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data (creates superadmin)
npm run prisma:seed
```

### 6. Start Development Server
```bash
npm run dev
```

## 🔒 API Endpoints (Auth)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| GET | `/api/v1/health` | Health check endpoint | No |

## 🏗️ Architecture Principles

- **Modular Design**: Features are grouped in `src/modules` for high cohesion.
- **Service Layer**: Business logic is separated from controllers.
- **Fail Fast**: Environment variables and request bodies are validated at runtime.
- **Standardized Responses**: All API responses follow a consistent JSON envelope.
- **Global Error Handling**: Centralized catch-all for operational and programmer errors.
