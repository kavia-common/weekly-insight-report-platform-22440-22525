const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const config = require('./config');

const rootRoutes = require('./routes');
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const metricsRoutes = require('./routes/metrics');

const { cookies, enrichUser } = require('./middleware/auth');

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

// Swagger UI with dynamic server url
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');
  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
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
});

// Body & cookie parsing
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Auth enrichment middleware (JWT from cookie)
app.use(cookies);
app.use(enrichUser);

// Mount routes
app.use('/', rootRoutes);
app.use('/auth', authRoutes);
app.use('/reports', reportsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/admin', adminRoutes);
app.use('/metrics', metricsRoutes);

/* Error handling middleware */
app.use((err, req, res, next) => {
  // Avoid leaking details in prod
  const message = config.env === 'development' ? err.message : 'Internal Server Error';
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message,
  });
});

module.exports = app;
