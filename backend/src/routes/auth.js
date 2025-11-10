const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth, auditAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and session management
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: Current user (or null if not logged in)
 */
router.get('/me', auditAccess('api.auth.me'), authController.me.bind(authController));

/**
 * @swagger
 * /auth/mock/login:
 *   post:
 *     tags: [Auth]
 *     summary: Mock login (dev only)
 *     description: Issues httpOnly session cookie using a mock email login. Requires MOCK_AUTH=true.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *       400:
 *         description: Missing data or MOCK_AUTH disabled
 */
router.post('/mock/login', auditAccess('api.auth.mockLogin'), authController.mockLogin.bind(authController));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (clear session)
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', requireAuth, auditAccess('api.auth.logout'), authController.logout.bind(authController));

/**
 * @swagger
 * /auth/oauth/callback:
 *   get:
 *     tags: [Auth]
 *     summary: OAuth callback placeholder
 *     responses:
 *       501:
 *         description: Not Implemented
 */
router.get('/oauth/callback', auditAccess('api.auth.oauthCallback'), authController.oauthPlaceholder.bind(authController));

module.exports = router;
