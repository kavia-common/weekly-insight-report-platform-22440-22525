/**
 * Centralized configuration loader for the backend.
 * Uses environment variables and provides sane defaults for local dev.
 */
require('dotenv').config();

const toBool = (v, def = false) => {
  if (v === undefined || v === null || v === '') return def;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
};

const config = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3001),
  mongoUri: process.env.MONGODB_URI || '',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',

  // Security and CORS
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  corsAllowCredentials: toBool(process.env.CORS_ALLOW_CREDENTIALS, true),

  // JWT & cookies
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    cookieName: process.env.SESSION_COOKIE_NAME || 'dt3_session',
    cookieSecure: toBool(process.env.COOKIE_SECURE, false),
    cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  },

  // Auth providers - placeholders for future non-mock setup
  auth: {
    mock: toBool(process.env.MOCK_AUTH, true),
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    azureClientId: process.env.AZURE_AD_CLIENT_ID || '',
    azureClientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
    oauthCallbackBaseUrl: process.env.OAUTH_CALLBACK_BASE_URL || '',
  },

  // Rate limiting
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 300),
  },

  // Seeding
  seed: {
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminName: process.env.ADMIN_NAME || 'Admin User',
  },
};

module.exports = config;
