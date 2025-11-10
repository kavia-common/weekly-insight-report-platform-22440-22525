const express = require('express');
const { requireAuth, requireRoles, auditAccess } = require('../middleware/auth');

const router = express.Router();

// Safely load controller to avoid startup crashes if file is missing
function safeLoadController() {
  try {
    // eslint-disable-next-line global-require
    return require('../controllers/adminController');
  } catch (e) {
    // Provide minimal fallback handlers
    const fallback = {
      // PUBLIC_INTERFACE
      async listUsers(_req, res) {
        /** Fallback controller: admin list users unavailable. */
        return res.status(503).json({ error: 'adminController unavailable' });
      },
      // PUBLIC_INTERFACE
      async assignRole(req, res) {
        /** Fallback controller: assign role unavailable. */
        return res.status(503).json({ error: 'adminController unavailable' });
      },
      // PUBLIC_INTERFACE
      async revokeRole(req, res) {
        /** Fallback controller: revoke role unavailable. */
        return res.status(503).json({ error: 'adminController unavailable' });
      },
    };
    // Log warning but do not crash
    // eslint-disable-next-line no-console
    console.warn('[Startup] adminController not found, using fallback:', e?.message || e);
    return fallback;
  }
}
const adminController = safeLoadController();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin role management and offboarding placeholders
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users
 *     responses:
 *       200:
 *         description: Users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users', requireAuth, requireRoles('admin'), auditAccess('api.admin.listUsers'), adminController.listUsers.bind(adminController));

/**
 * @swagger
 * /admin/roles/assign:
 *   post:
 *     tags: [Admin]
 *     summary: Assign role to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, role]
 *             properties:
 *               userId: { type: string }
 *               role: { type: string, enum: [employee, manager, admin] }
 *     responses:
 *       200:
 *         description: Role assigned
 */
router.post('/roles/assign', requireAuth, requireRoles('admin'), auditAccess('api.admin.assignRole'), adminController.assignRole.bind(adminController));

/**
 * @swagger
 * /admin/roles/revoke:
 *   post:
 *     tags: [Admin]
 *     summary: Revoke role from user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, role]
 *             properties:
 *               userId: { type: string }
 *               role: { type: string, enum: [employee, manager, admin] }
 *     responses:
 *       200:
 *         description: Role revoked
 */
router.post('/roles/revoke', requireAuth, requireRoles('admin'), auditAccess('api.admin.revokeRole'), adminController.revokeRole.bind(adminController));

module.exports = router;
