const config = require('../config');
const { signSession, cookieOptions } = require('../utils/jwt');
const userService = require('../services/userService');
const roleRepo = require('../repositories/roleAssignmentRepository');
const auditRepo = require('../repositories/auditLogRepository');

/**
 * Authentication controller
 * Provides MOCK auth (email-only) and placeholders for Google/Azure OAuth callbacks.
 */
class AuthController {
  // PUBLIC_INTERFACE
  async me(req, res) {
    /** Return the current authenticated user profile and roles. */
    if (!req.user) return res.status(200).json({ user: null, roles: [] });
    const roles = req.roles || (await roleRepo.getUserRoles(req.user.id));
    return res.status(200).json({ user: req.user, roles });
  }

  // PUBLIC_INTERFACE
  async mockLogin(req, res) {
    /**
     * Mock login for local/dev usage.
     * Body: { email: string, name?: string }
     * Issues httpOnly cookie with JWT.
     */
    if (!config.auth.mock) {
      return res.status(400).json({ error: 'MOCK_AUTH disabled' });
    }
    const { email, name } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });

    const user = await userService.ensureUser({
      email,
      name: name || email.split('@')[0],
      provider: 'mock',
      providerId: email,
      actorContext: null,
    });

    const token = signSession({ sub: user._id?.toString?.(), email: user.email });
    res.cookie(config.jwt.cookieName, token, cookieOptions());

    try {
      await auditRepo.createAuditLog({
        actor: user._id,
        action: 'user.login',
        resourceType: 'User',
        resourceId: user._id?.toString?.(),
        metadata: { provider: 'mock' },
      });
    } catch (_) {}

    return res.status(200).json({ ok: true });
  }

  // PUBLIC_INTERFACE
  async logout(req, res) {
    /** Clear session cookie and emit audit log. */
    res.clearCookie(config.jwt.cookieName, { ...cookieOptions(), maxAge: 0 });
    try {
      await auditRepo.createAuditLog({
        actor: req.user?.id || null,
        action: 'user.logout',
        resourceType: 'User',
        resourceId: req.user?.id || null,
      });
    } catch (_) {}
    return res.status(200).json({ ok: true });
  }

  // PUBLIC_INTERFACE
  async oauthPlaceholder(req, res) {
    /** Placeholder endpoint for Google/Azure OAuth callback. */
    return res.status(501).json({
      error: 'Not Implemented',
      message: 'OAuth callback integration placeholder (Google/Azure).',
    });
  }
}

module.exports = new AuthController();
