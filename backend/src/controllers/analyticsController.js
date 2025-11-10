'use strict';

/**
 * AnalyticsController
 * Provides aggregate insights. Minimal placeholder to avoid DB dependency for boot.
 */
class AnalyticsController {
  // PUBLIC_INTERFACE
  async aggregates(req, res) {
    /** Return mocked aggregates for now. */
    const weeks = Number(req.query.weeks || 4);
    return res.status(200).json({
      rangeWeeks: weeks,
      summaries: [],
      totals: { reports: 0, users: 0 },
    });
  }
}

module.exports = new AnalyticsController();
