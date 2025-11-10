'use strict';

/**
 * AdminController
 * Provides admin operations. This minimal implementation avoids DB dependencies to ensure server startup.
 */
class AdminController {
  // PUBLIC_INTERFACE
  async listUsers(_req, res) {
    /** Return a placeholder list of users. Replace with real implementation wired to repositories. */
    return res.status(200).json({ users: [], total: 0 });
  }

  // PUBLIC_INTERFACE
  async assignRole(req, res) {
    /** Assign a role to a user (placeholder). */
    const { userId, role } = req.body || {};
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }
    return res.status(200).json({ ok: true, userId, role });
  }

  // PUBLIC_INTERFACE
  async revokeRole(req, res) {
    /** Revoke a role from a user (placeholder). */
    const { userId, role } = req.body || {};
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }
    return res.status(200).json({ ok: true, userId, role });
  }
}

module.exports = new AdminController();
