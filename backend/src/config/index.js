/**
 * Centralized configuration loader for the backend.
 * Uses environment variables and provides sane defaults for local dev.
 */
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3001),
  mongoUri: process.env.MONGODB_URI || '',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',

  // Seeding
  seed: {
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminName: process.env.ADMIN_NAME || 'Admin User',
  },
};

module.exports = config;
