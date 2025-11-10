const app = require('./app');
const { connectMongo, registerShutdownHooks } = require('./db/mongoose');
const config = require('./config');
const readiness = require('./services/readiness');

const PORT = Number(process.env.PORT || config.port || 3001);
const HOST = process.env.HOST || config.host || '0.0.0.0';

let server;

// Global process-level safety nets to avoid silent crashes
process.on('unhandledRejection', (reason) => {
  console.error('[Startup] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Startup] Uncaught Exception:', err);
  // Do not exit immediately; allow container to keep liveness if possible.
});

async function bootstrap() {
  try {
    console.log('[Startup] Config:', {
      env: config.env,
      host: HOST,
      port: PORT,
      corsOrigin: config.frontendOrigin,
      mockAuth: config.auth?.mock,
      mongoConfigured: !!config.mongoUri,
    });

    // Start HTTP server immediately; readiness will be set in listen callback.
    console.log(`[Startup] Attempting to bind HTTP server to ${HOST}:${PORT} ...`);
    server = app.listen(PORT, HOST, () => {
      readiness.setReady(true);
      console.log(`[Startup] Server listening on http://${HOST}:${PORT}`);
      console.log('[Startup] Health endpoints:');
      console.log(`  - Liveness:  http://${HOST}:${PORT}/health/live`);
      console.log(`  - Readiness: http://${HOST}:${PORT}/health/ready`);
      console.log(`  - Docs:      http://${HOST}:${PORT}/docs`);
    });

    server.on('error', (err) => {
      console.error('[Startup] HTTP server error:', err);
    });

    // After starting HTTP server, attempt Mongo connection asynchronously (non-blocking)
    if (config.mongoUri) {
      (async () => {
        try {
          await connectMongo();
          console.log('[Startup] MongoDB connected (post-start).');
        } catch (dbErr) {
          console.error('[Startup] MongoDB connection failed (post-start). Server continues without DB:', dbErr?.message || dbErr);
        }
      })();
    } else {
      console.warn('[Startup] MONGODB_URI not set. Running without MongoDB.');
    }

    registerShutdownHooks();
  } catch (err) {
    console.error('[Startup] Failed to start server:', err);
    // Avoid early termination to let liveness probe detect and restart if truly broken.
    // Intentionally not calling process.exit here to prevent premature container death.
  }
}

bootstrap();

// Graceful shutdown for SIGTERM targeting HTTP server (Mongo handled in registerShutdownHooks)
process.on('SIGTERM', () => {
  console.log('[Shutdown] SIGTERM signal received: closing HTTP server');
  readiness.setReady(false);
  if (server) {
    server.close(() => {
      console.log('[Shutdown] HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = server;
