'use strict';

/**
 * MetricsController
 * Returns basic runtime metrics for observability.
 */
class MetricsController {
  // PUBLIC_INTERFACE
  async metrics(_req, res) {
    /** Return process-level metrics. */
    const mem = process.memoryUsage();
    return res.status(200).json({
      uptimeSec: process.uptime(),
      pid: process.pid,
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external,
      },
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new MetricsController();
