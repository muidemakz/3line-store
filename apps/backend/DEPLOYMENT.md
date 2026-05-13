# 🚀 Production Deployment Guide

This guide provides the necessary steps to deploy the Palliative Care Backend to production environments like **Railway** or **Render**.

## 📋 Deployment Checklist

1. [x] **Environment Variables**: All variables from `.env.example` must be set in the hosting provider.
2. [x] **Database Connection**: Ensure `DATABASE_URL` uses a production-grade PostgreSQL instance.
3. [x] **Build Command**: `npm run build`
4. [x] **Start Command**: `npm run start`
5. [x] **Migration Strategy**: Use `npx prisma migrate deploy` in your CI/CD or as a pre-deploy command.
6. [x] **SSL/HTTPS**: Ensure the provider handles SSL termination (automatic on Railway/Render).
7. [x] **Error Monitoring**: Consider integrating **Sentry** or **Logtail** for remote logging.

---

## 🚂 Railway Setup (Recommended)

Railway is excellent for this stack due to its native support for PostgreSQL and automatic environment variable injection.

### Steps:
1. **Connect Repository**: Link your GitHub repo to Railway.
2. **Add PostgreSQL**: Click "New" -> "Database" -> "Add PostgreSQL". Railway will automatically provide a `DATABASE_URL`.
3. **Configure Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a long, secure string.
   - `JWT_REFRESH_SECRET`: Generate a long, secure string.
   - `ALLOWED_ORIGINS`: Set to your production frontend URLs.
4. **Deploy**: Railway will detect the `package.json` and use the `build` and `start` scripts automatically.

---

## ☁️ Render Setup

Render is a robust alternative with great scaling capabilities.

### Steps:
1. **New Web Service**: Connect your repo.
2. **Environment**: Select `Node`.
3. **Build Command**: `npm run build && npx prisma generate`
4. **Start Command**: `npm run start`
5. **Advanced Settings**:
   - Add a "Pre-Deploy Command": `npx prisma migrate deploy`
6. **Database**: Use Render's managed PostgreSQL or an external provider like **Supabase** or **Neon**.

---

## 🗄️ Recommended PostgreSQL Hosting

For a production-ready application, avoid self-hosting the database in a container if possible.

1. **Supabase / Neon**: High-performance, serverless PostgreSQL with great connection pooling.
2. **Railway Managed Postgres**: Best for ease of use within the Railway ecosystem.
3. **AWS RDS**: Best for massive scale and enterprise-grade compliance.

---

## 🔒 Security Best Practices

- **Secrets**: Never commit your `.env` file.
- **CORS**: Ensure `ALLOWED_ORIGINS` is strictly limited to your trusted frontends.
- **Rate Limiting**: Our global rate limiter is active. Adjust `RATE_LIMIT_MAX_REQUESTS` in production to balance security and usability.
- **Logging**: Logs are sent to the console in JSON format (`winston`). Use your provider's log explorer to monitor for `error` level events.
