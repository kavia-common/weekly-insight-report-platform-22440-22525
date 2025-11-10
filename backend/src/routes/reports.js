const express = require('express');
const reportsController = require('../controllers/reportsController');
const { requireAuth, requireRoles, auditAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Weekly reports CRUD
 */

/**
 * @swagger
 * /reports/draft:
 *   post:
 *     tags: [Reports]
 *     summary: Create or update a draft report for the current user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weekStart, content]
 *             properties:
 *               weekStart:
 *                 type: string
 *                 format: date
 *               content:
 *                 type: object
 *     responses:
 *       200:
 *         description: Draft saved
 *       401:
 *         description: Unauthorized
 */
router.post('/draft', requireAuth, auditAccess('api.reports.upsertDraft'), reportsController.upsertDraft.bind(reportsController));

/**
 * @swagger
 * /reports/{id}/submit:
 *   post:
 *     tags: [Reports]
 *     summary: Submit a draft report
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report submitted
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/submit', requireAuth, auditAccess('api.reports.submit'), reportsController.submit.bind(reportsController));

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Get a report by ID (owner or admin/manager)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Report
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get('/:id', requireAuth, auditAccess('api.reports.getById'), reportsController.getById.bind(reportsController));

/**
 * @swagger
 * /reports/me:
 *   get:
 *     tags: [Reports]
 *     summary: List current user's reports
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/me', requireAuth, auditAccess('api.reports.listMine'), reportsController.listMine.bind(reportsController));

/**
 * @swagger
 * /reports/export/placeholder:
 *   post:
 *     tags: [Reports]
 *     summary: Export/Share placeholder
 *     responses:
 *       501:
 *         description: Not Implemented
 */
router.post('/export/placeholder', requireAuth, auditAccess('api.reports.exportPlaceholder'), reportsController.exportPlaceholder.bind(reportsController));

module.exports = router;
