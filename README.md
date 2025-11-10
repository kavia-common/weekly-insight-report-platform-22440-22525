# DigitalT3 Backend (Express)

Backend APIs for authentication, reports, analytics, admin, and metrics.

## Prerequisites
- Node.js 18+
- MongoDB (optional for limited no-DB mode; required for reports/audit/roles persistence)

## Environment
Copy backend/.env.example to backend/.env and adjust:
- FRONTEND_ORIGIN: e.g., http://localhost:3000
- CORS_ALLOW_CREDENTIALS: true to enable cookies
- JWT_* and COOKIE_* settings for session cookies
- MOCK_AUTH: true for development email-based login (/auth/mock/login)
- MONGODB_URI: Mongo connection string if persistence is desired

## Install
cd backend
npm install

## Run (dev)
npm run dev
- Liveness:     http://localhost:3001/health/live
- Readiness:    http://localhost:3001/health/ready
- OpenAPI Docs: http://localhost:3001/docs

## Build & Run (prod)
npm start

## Seeding (optional)
Configure ADMIN_EMAIL in .env then run:
npm run seed

## CORS & Cookies
- CORS origin is set via FRONTEND_ORIGIN and credentials enabled by CORS_ALLOW_CREDENTIALS.
- Session cookie (httpOnly) name via SESSION_COOKIE_NAME. Secure/sameSite configurable via COOKIE_SECURE and COOKIE_SAMESITE.

## Feature flags
- MOCK_AUTH=true enables /auth/mock/login for development.
- OAuth providers are placeholders (Google/Azure) and not yet implemented.

## OpenAPI
- Swagger is generated from route JSDoc annotations; served at /docs.
- To regenerate a static openapi.json snapshot: npm run openapi (writes to interfaces/openapi.json).