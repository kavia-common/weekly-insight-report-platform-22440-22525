const express = require('express');
const healthController = require('../controllers/health');
const { getDbHealth } = require('../services/db');
const readiness = require('../services/readiness');
const config = require('../config');

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
