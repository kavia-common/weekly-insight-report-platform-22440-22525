const express = require('express');
const healthController = require('../controllers/health');
const { getDbHealth } = require('../services/db');

const router = express.Router();

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
  // If MongoDB is configured but disconnected, report not ready; otherwise OK.
  const mongoConfigured = !!process.env.MONGODB_URI;
  const ready = !mongoConfigured || db.state === 'connected';
  const payload = {
    status: ready ? 'ready' : 'not-ready',
    db,
    timestamp: new Date().toISOString(),
  };
  return res.status(ready ? 200 : 503).json(payload);
});

module.exports = router;
