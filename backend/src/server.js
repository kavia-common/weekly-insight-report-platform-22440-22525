const app = require('./app');
const { connectMongo, registerShutdownHooks } = require('./db/mongoose');
const config = require('./config');

const PORT = config.port || 3000;
const HOST = config.host || '0.0.0.0';

let server;

async function bootstrap() {
  try {
    await connectMongo();
    console.log('MongoDB connected. Starting HTTP server...');
    server = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
    registerShutdownHooks();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown for SIGTERM targeting HTTP server (Mongo handled in registerShutdownHooks)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = server;
