const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth, requireRoles, auditAccess } = require('../middleware/auth');

const router = express.Router();

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
