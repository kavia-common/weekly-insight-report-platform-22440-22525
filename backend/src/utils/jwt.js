const jwt = require('jsonwebtoken');
const config = require('../config');

// PUBLIC_INTERFACE
function signSession(payload) {
  /** Sign a JWT for session cookies using configured secret and expiration. */
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

// PUBLIC_INTERFACE
function verifySession(token) {
  /** Verify a session JWT, returning the decoded payload or null if invalid. */
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (_) {
    return null;
  }
}

// PUBLIC_INTERFACE
function cookieOptions() {
  /** Returns standard cookie options for the session cookie (httpOnly, secure, sameSite). */
  return {
    httpOnly: true,
    secure: !!config.jwt.cookieSecure,
    sameSite: config.jwt.cookieSameSite,
    domain: config.jwt.cookieDomain || undefined,
    // maxAge intentionally omitted; rely on JWT expiry
    path: '/',
  };
}

module.exports = {
  signSession,
  verifySession,
  cookieOptions,
};
