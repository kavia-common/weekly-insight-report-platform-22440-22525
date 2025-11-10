'use strict';

const reportService = require('../services/reportService');
const reportRepo = require('../repositories/reportRepository');

/**
 * ReportsController
 * Implements CRUD-ish flows for weekly reports including draft autosave and version history.
 * Access control:
 *  - All routes require authentication (enforced in routes).
 *  - Get by ID allowed to owner or users with role 'manager' or 'admin'.
 */
class ReportsController {
  // PUBLIC_INTERFACE
  async upsertDraft(req, res) {
    /** Create or update a draft report for the given weekStart, auto-versioning. */
    try {
      const { weekStart, content } = req.body || {};
      if (!weekStart || typeof content !== 'object') {
        return res.status(400).json({ error: 'weekStart (date) and content (object) are required' });
      }
      const userId = req.user.id;
      const draft = await reportService.createOrUpdateDraft({
        userId,
        weekStart: new Date(weekStart),
        content,
        actorContext: { actor: userId },
      });
      return res.status(200).json({ report: draft });
    } catch (e) {
      const message = e?.message || 'Failed to save draft';
      return res.status(500).json({ error: message });
    }
  }

  // PUBLIC_INTERFACE
  async submit(req, res) {
    /** Submit a draft report; DB enforces unique submitted per (user, week). */
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'Report id is required' });

      // Basic ownership check before submit
      const existing = await reportRepo.getReportById(id);
      if (!existing) return res.status(404).json({ error: 'Report not found' });
      if (String(existing.user) !== String(req.user.id)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (existing.status !== 'draft') {
        return res.status(400).json({ error: 'Only draft reports can be submitted' });
      }

      const submitted = await reportService.submit(id, { actor: req.user.id });
      return res.status(200).json({ report: submitted });
    } catch (e) {
      if (e && e.code === 'DUPLICATE_SUBMITTED_WEEK') {
        return res.status(409).json({ error: e.message || 'Duplicate submitted week' });
      }
      const message = e?.message || 'Failed to submit report';
      return res.status(500).json({ error: message });
    }
  }

  // PUBLIC_INTERFACE
  async getById(req, res) {
    /** Get a report by ID, allowed for owner or manager/admin. */
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'Report id is required' });

      const doc = await reportRepo.getReportById(id);
      if (!doc) return res.status(404).json({ error: 'Not found' });

      const isOwner = String(doc.user) === String(req.user.id);
      const roles = new Set(req.roles || []);
      const privileged = roles.has('manager') || roles.has('admin');

      if (!isOwner && !privileged) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return res.status(200).json({ report: doc });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to get report' });
    }
  }

  // PUBLIC_INTERFACE
  async listMine(req, res) {
    /** List current user's reports with pagination. */
    try {
      const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
      const offset = Math.max(0, Number(req.query.offset || 0));
      const reports = await reportRepo.listReportsByUser(req.user.id, { limit, offset });
      return res.status(200).json({ reports, total: reports.length, limit, offset });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to list reports' });
    }
  }

  // PUBLIC_INTERFACE
  async exportPlaceholder(_req, res) {
    /** Export/share placeholder endpoint; to be implemented (PDF/Excel/Email/Slack/Teams). */
    return res.status(501).json({
      error: 'Not Implemented',
      message: 'Export/share functionality will be implemented in a future iteration.',
    });
  }
}

module.exports = new ReportsController();
