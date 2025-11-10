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

    // Attempt to connect to MongoDB only if configured, but never block server start.
    if (config.mongoUri) {
      try {
        await connectMongo();
        console.log('[Startup] MongoDB connected. Proceeding to start HTTP server...');
      } catch (dbErr) {
        console.error('[Startup] MongoDB connection failed. Starting HTTP server without DB:', dbErr?.message || dbErr);
        // continue to start server; readiness endpoint will reflect DB state as not-ready if required
      }
    } else {
      console.warn('[Startup] MONGODB_URI not set. Skipping MongoDB connection and starting HTTP server without DB.');
    }

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
