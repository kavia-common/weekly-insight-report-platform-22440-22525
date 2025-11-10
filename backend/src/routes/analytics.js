const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireRoles, auditAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Aggregated analytics for managers/admins
 */

/**
 * @swagger
 * /analytics/aggregates:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics aggregates
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema: { type: integer }
 *         description: Number of recent weeks to consider
 *     responses:
 *       200:
 *         description: Aggregates
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/aggregates', requireAuth, requireRoles('manager', 'admin'), auditAccess('api.analytics.aggregates'), analyticsController.aggregates.bind(analyticsController));

module.exports = router;
