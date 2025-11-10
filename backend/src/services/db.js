/**
 * Simple DB health utility for future endpoints.
 */
const mongoose = require('mongoose');

// PUBLIC_INTERFACE
function getDbHealth() {
  /** Return a simple object about Mongoose connection state. */
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  return {
    state,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

module.exports = { getDbHealth };
