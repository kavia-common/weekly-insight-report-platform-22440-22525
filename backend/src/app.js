'use strict';

const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const readiness = require('./services/readiness');
const { getDbHealth } = require('./services/db');

// Helper: safely import a module; on failure, return a no-op router so startup never crashes
function safeImportRouter(modulePath, label) {
  try {
    const router = require(modulePath);
    return router;
  } catch (e) {
    console.warn(
      `[Startup] Failed to import ${label} (${modulePath}). Using fallback empty router.`,
      e?.message || e
    );
    const r = express.Router();
    r.use((_req, res, _next) => res.status(503).json({ error: `${label} unavailable` }));
    return r;
  }
}

// Try to load swagger spec; if it fails, serve a minimal fallback spec
let swaggerSpec;
try {
  swaggerSpec = require('../swagger');
} catch (e) {
  console.warn('[Startup] Swagger spec generation failed, serving minimal docs:', e?.message || e);
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'DigitalT3 Weekly Report Platform - Backend API',
      version: '1.0.0',
      description: 'Fallback swagger spec (generation failed).',
    },
    paths: {},
  };
}

// Initialize express app
const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // can be customized per deployment
  })
);

// Trust proxy for secure cookies in certain deployments
app.set('trust proxy', true);

// CORS
app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: !!config.corsAllowCredentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiter (generic)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// EARLY Health routes: mounted before any middleware that could touch DB
// Minimal root route to simplify readiness checks
app.get('/', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Liveness: always ok if process is running
app.get('/health/live', (_req, res) => {
  return res.status(200).json({ status: 'live', timestamp: new Date().toISOString() });
});

// Readiness: strictly linked to HTTP server listening state; DB state is informational only
app.get('/health/ready', (_req, res) => {
  const serverReady = readiness.isReady();
  const db = getDbHealth();
  return res.status(serverReady ? 200 : 503).json({
    status: serverReady ? 'ready' : 'not-ready',
    serverReady,
    db,
    timestamp: new Date().toISOString(),
    note: 'Readiness reflects HTTP server listening state; DB status is informational only.',
  });
});

// Swagger UI with dynamic server url; protect against runtime errors
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  try {
    const host = req.get('host');
    let protocol = req.protocol;
    const actualPort = req.socket.localPort;
    const hasPort = host.includes(':');
    const needsPort =
      !hasPort &&
      ((protocol === 'http' && actualPort !== 80) || (protocol === 'https' && actualPort !== 443));
    const fullHost = needsPort ? `${host}:${actualPort}` : host;
    protocol = req.secure ? 'https' : protocol;

    const dynamicSpec = {
      ...swaggerSpec,
      servers: [
        {
          url: `${protocol}://${fullHost}`,
        },
      ],
    };
    swaggerUi.setup(dynamicSpec)(req, res, next);
  } catch (err) {
    console.error('[Docs] Error mounting Swagger UI:', err);
    res.status(500).json({ error: 'Failed to render API docs' });
  }
});

// Body & cookie parsing
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Auth enrichment middleware (JWT from cookie).
// Note: this may consult DB when a valid cookie is present; health routes are already mounted above.
const { cookies, enrichUser } = safeImportRouter('./middleware/auth', 'middleware.auth');
app.use(cookies);
app.use(enrichUser);

// Routes: guard all router imports so missing files never crash startup.
const rootRoutes = safeImportRouter('./routes', 'routes.index');
const authRoutes = safeImportRouter('./routes/auth', 'routes.auth');
const reportsRoutes = safeImportRouter('./routes/reports', 'routes.reports');
const analyticsRoutes = safeImportRouter('./routes/analytics', 'routes.analytics');
const adminRoutes = safeImportRouter('./routes/admin', 'routes.admin');
const metricsRoutes = safeImportRouter('./routes/metrics', 'routes.metrics');

// Mount routes
app.use('/', rootRoutes);
app.use('/auth', authRoutes);
app.use('/reports', reportsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/admin', adminRoutes);
app.use('/metrics', metricsRoutes);

/* Error handling middleware */
app.use((err, _req, res, _next) => {
  // Avoid leaking details in prod
  const message = config.env === 'development' ? err.message : 'Internal Server Error';
  console.error('[Error]', err && err.stack ? err.stack : err);
  res.status(500).json({
    status: 'error',
    message,
  });
});

module.exports = app;
