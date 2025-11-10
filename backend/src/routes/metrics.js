const express = require('express');
const { auditAccess } = require('../middleware/auth');

const router = express.Router();

function safeLoadController() {
  try {
    // eslint-disable-next-line global-require
    return require('../controllers/metricsController');
  } catch (e) {
    const fallback = {
      // PUBLIC_INTERFACE
      async metrics(_req, res) {
        /** Fallback metrics endpoint to keep observability basic if controller missing. */
        return res.status(200).json({
          uptimeSec: process.uptime(),
          note: 'metricsController unavailable',
          timestamp: new Date().toISOString(),
        });
      },
    };
    // eslint-disable-next-line no-console
    console.warn('[Startup] metricsController not found, using fallback:', e?.message || e);
    return fallback;
  }
}
const metricsController = safeLoadController();

/**
 * @swagger
 * tags:
 *   - name: Metrics
 *     description: Health and runtime metrics
 */

/**
 * @swagger
 * /metrics:
 *   get:
 *     tags: [Metrics]
 *     summary: Get runtime metrics
 *     responses:
 *       200:
 *         description: Metrics
 */
router.get('/', auditAccess('api.metrics'), metricsController.metrics.bind(metricsController));

module.exports = router;
