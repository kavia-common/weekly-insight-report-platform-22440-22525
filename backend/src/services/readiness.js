'use strict';

/**
 * Readiness service
 * Maintains a simple in-memory readiness flag that indicates whether the HTTP server
 * is actively listening for requests. This should be set to true only after app.listen()
 * callback fires successfully, and can be toggled if needed during graceful shutdowns.
 */

// PUBLIC_INTERFACE
function createReadiness() {
  /** Create a readiness state container and expose setters/getters. */
  let ready = false;

  return {
    // PUBLIC_INTERFACE
    setReady(value) {
      /** Set the readiness flag. */
      ready = !!value;
    },
    // PUBLIC_INTERFACE
    isReady() {
      /** Return current readiness boolean. */
      return ready;
    },
  };
}

const readiness = createReadiness();

module.exports = readiness;
