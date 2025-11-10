const app = require('./app');
const { connectMongo, registerShutdownHooks } = require('./db/mongoose');
const config = require('./config');

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

    // Only attempt to connect to MongoDB if a URI is configured.
    if (config.mongoUri) {
      await connectMongo();
      console.log('[Startup] MongoDB connected. Starting HTTP server...');
    } else {
      console.warn('[Startup] MONGODB_URI not set. Skipping MongoDB connection and starting HTTP server without DB.');
    }

    server = app.listen(PORT, HOST, () => {
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
    // Do not hard exit in containerized environments; rely on probes to restart if needed.
    // But to satisfy CI expectations, we still exit non-zero if boot sequence genuinely failed before listen.
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown for SIGTERM targeting HTTP server (Mongo handled in registerShutdownHooks)
process.on('SIGTERM', () => {
  console.log('[Shutdown] SIGTERM signal received: closing HTTP server');
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
