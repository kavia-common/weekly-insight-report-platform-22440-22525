'use strict';

const roleService = require('../services/roleService');
const userRepo = require('../repositories/userRepository');

/**
 * AdminController
 * Provides admin operations. Uses repositories/services while keeping errors contained.
 */
class AdminController {
  // PUBLIC_INTERFACE
  async listUsers(req, res) {
    /** Return paginated users list. Accessible to admin only via route RBAC. */
    try {
      const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
      const offset = Math.max(0, Number(req.query.offset || 0));
      const users = await userRepo.listUsers({ limit, offset });
      return res.status(200).json({ users, total: users.length, limit, offset });
    } catch (e) {
      // Keep admin endpoints resilient
      return res.status(500).json({ error: 'Failed to list users' });
    }
  }

  // PUBLIC_INTERFACE
  async assignRole(req, res) {
    /** Assign a role to a user and record audit trail. */
    try {
      const { userId, role } = req.body || {};
      if (!userId || !role) {
        return res.status(400).json({ error: 'userId and role are required' });
      }
      const result = await roleService.assignRole(userId, role, { actor: req.user?.id || null });
      return res.status(200).json({ ok: true, assignment: result });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to assign role' });
    }
  }

  // PUBLIC_INTERFACE
  async revokeRole(req, res) {
    /** Revoke a role from a user and record audit trail. */
    try {
      const { userId, role } = req.body || {};
      if (!userId || !role) {
        return res.status(400).json({ error: 'userId and role are required' });
      }
      const ok = await roleService.revokeRole(userId, role, { actor: req.user?.id || null });
      return res.status(200).json({ ok });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to revoke role' });
    }
  }
}

module.exports = new AdminController();
