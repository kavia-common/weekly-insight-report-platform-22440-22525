const express = require('express');
const { getDbHealth } = require('../services/db');
const readiness = require('../services/readiness');

const router = express.Router();

// Safely load health controller (app.js serves health endpoints early regardless)
function safeLoadHealthController() {
  try {
    // eslint-disable-next-line global-require
    return require('../controllers/health');
  } catch (e) {
    // Minimal fallback service
    const fallback = {
      check(_req, res) {
        return res.status(200).json({
          status: 'ok',
          message: 'Service is healthy',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          note: 'health controller unavailable (fallback)',
        });
      },
    };
    // eslint-disable-next-line no-console
    console.warn('[Startup] health controller not found, using fallback:', e?.message || e);
    return fallback;
  }
}
const healthController = safeLoadHealthController();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health checks
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     responses:
 *       200:
 *         description: Always OK if the process is running
 */
router.get('/health/live', (req, res) => {
  return res.status(200).json({ status: 'live', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe
 *     description: Indicates if the app is ready to serve traffic. Includes DB connectivity state when configured.
 *     responses:
 *       200:
 *         description: Ready
 *       503:
 *         description: Not ready
 */
router.get('/health/ready', (req, res) => {
  const db = getDbHealth();
  // Readiness is tied to HTTP server binding only. DB readiness is informative.
  const serverReady = readiness.isReady();

  const payload = {
    status: serverReady ? 'ready' : 'not-ready',
    serverReady,
    db,
    timestamp: new Date().toISOString(),
    note: 'Readiness reflects HTTP server listening state; DB status is informational only.',
  };

  return res.status(serverReady ? 200 : 503).json(payload);
});

module.exports = router;
