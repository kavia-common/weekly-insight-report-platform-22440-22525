const cookieParser = require('cookie-parser');
const { verifySession } = require('../utils/jwt');
const roleRepo = require('../repositories/roleAssignmentRepository');
const userRepo = require('../repositories/userRepository');
const config = require('../config');
const auditRepo = require('../repositories/auditLogRepository');

// Attach cookie parser
const cookies = cookieParser();

// PUBLIC_INTERFACE
async function enrichUser(req, _res, next) {
  /** Parse JWT from cookie and populate req.user and req.roles if valid. */
  try {
    const token = req.cookies?.[config.jwt.cookieName];
    if (!token) return next();
    const decoded = verifySession(token);
    if (!decoded || !decoded.sub) return next();

    // Fetch a lightweight user object and roles
    const user = await userRepo.findUserById(decoded.sub);
    if (user && user.isActive !== false) {
      req.user = {
        id: user._id?.toString?.(),
        email: user.email,
        name: user.name,
      };
      req.roles = await roleRepo.getUserRoles(user._id);
    }
    return next();
  } catch (e) {
    // ignore token errors, proceed unauthenticated
    return next();
  }
}

// PUBLIC_INTERFACE
function requireAuth(req, res, next) {
  /** Require a valid authenticated user. */
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

// PUBLIC_INTERFACE
function requireRoles(...roles) {
  /** Require that the user has at least one of the required roles. */
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const have = new Set(req.roles || []);
    const ok = roles.some((r) => have.has(r));
    if (!ok) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

// PUBLIC_INTERFACE
async function auditAccess(action) {
  /** Middleware factory to create an audit log for an API access event. */
  return async (req, _res, next) => {
    try {
      await auditRepo.createAuditLog({
        actor: req.user?.id || null,
        action,
        resourceType: 'API',
        resourceId: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent') || null,
        metadata: { method: req.method },
      });
    } catch (_) {
      // swallow audit failures
    }
    next();
  };
}

module.exports = {
  cookies,
  enrichUser,
  requireAuth,
  requireRoles,
  auditAccess,
};
