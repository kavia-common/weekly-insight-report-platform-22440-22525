const express = require('express');
const metricsController = require('../controllers/metricsController');
const { auditAccess } = require('../middleware/auth');

const router = express.Router();

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
