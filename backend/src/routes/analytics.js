const express = require('express');
const { requireAuth, requireRoles, auditAccess } = require('../middleware/auth');

const router = express.Router();

function safeLoadController() {
  try {
    // eslint-disable-next-line global-require
    return require('../controllers/analyticsController');
  } catch (e) {
    const fallback = {
      // PUBLIC_INTERFACE
      async aggregates(_req, res) {
        /** Fallback controller: analytics unavailable. */
        return res.status(503).json({ error: 'analyticsController unavailable' });
      },
    };
    // eslint-disable-next-line no-console
    console.warn('[Startup] analyticsController not found, using fallback:', e?.message || e);
    return fallback;
  }
}
const analyticsController = safeLoadController();

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
