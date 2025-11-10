'use strict';

/**
 * ReportsController
 * Placeholder implementations to allow server boot without database connectivity.
 * Replace with real service calls once MongoDB is configured.
 */
class ReportsController {
  // PUBLIC_INTERFACE
  async upsertDraft(_req, res) {
    /** Create or update a draft report (placeholder). */
    return res.status(501).json({ error: 'Not Implemented', message: 'Draft upsert requires DB.' });
  }

  // PUBLIC_INTERFACE
  async submit(_req, res) {
    /** Submit a draft report (placeholder). */
    return res.status(501).json({ error: 'Not Implemented', message: 'Report submit requires DB.' });
  }

  // PUBLIC_INTERFACE
  async getById(_req, res) {
    /** Get a report by ID (placeholder). */
    return res.status(501).json({ error: 'Not Implemented', message: 'Get report requires DB.' });
  }

  // PUBLIC_INTERFACE
  async listMine(_req, res) {
    /** List current user's reports (placeholder). */
    return res.status(200).json({ reports: [], total: 0 });
  }

  // PUBLIC_INTERFACE
  async exportPlaceholder(_req, res) {
    /** Export/share placeholder. */
    return res.status(501).json({ error: 'Not Implemented', message: 'Export requires implementation.' });
  }
}

module.exports = new ReportsController();
