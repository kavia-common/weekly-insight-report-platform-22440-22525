/**
 * Mongoose connection singleton for MongoDB.
 * Handles initialization, health, and graceful shutdown.
 */
const mongoose = require('mongoose');
const config = require('../config');

let isConnected = false;

// PUBLIC_INTERFACE
async function connectMongo() {
  /** Connect to Mongo using the configured URI. Logs readiness on success. */
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is not set. Please configure it in the environment.');
  }

  // Recommended options for Mongoose 8+
  await mongoose.connect(config.mongoUri, {
    // bufferCommands default is true; we can disable for explicit failures
    // bufferCommands: false,
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10,
  });

  isConnected = true;

  // Connection event logs
  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] connected');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] reconnected');
  });
  mongoose.connection.on('disconnected', () => {
    console.log('[MongoDB] disconnected');
    isConnected = false;
  });
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] connection error:', err);
  });

  console.log('[MongoDB] readiness: connected and ready');
  return mongoose.connection;
}

// PUBLIC_INTERFACE
async function disconnectMongo() {
  /** Disconnect from MongoDB gracefully. */
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
  return true;
}

// Register graceful shutdown
function registerShutdownHooks() {
  const shutdown = async (signal) => {
    try {
      console.log(`Received ${signal}. Closing MongoDB connection...`);
      await disconnectMongo();
      console.log('MongoDB connection closed.');
    } catch (e) {
      console.error('Error during MongoDB shutdown:', e);
    } finally {
      process.exit(0);
    }
  };
  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => shutdown(sig));
  });
}

module.exports = {
  connectMongo,
  disconnectMongo,
  registerShutdownHooks,
};
