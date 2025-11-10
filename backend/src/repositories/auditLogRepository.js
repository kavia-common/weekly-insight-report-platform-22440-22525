const AuditLog = require('../models/auditLog');

// PUBLIC_INTERFACE
async function createAuditLog({ actor = null, action, resourceType = null, resourceId = null, ip = null, userAgent = null, metadata = {} }) {
  /** Create an audit log record. */
  const log = await AuditLog.create({
    actor,
    action,
    resourceType,
    resourceId,
    ip,
    userAgent,
    metadata,
  });
  return log.toObject();
}

// PUBLIC_INTERFACE
async function queryAuditLogs({ actor = null, action = null, resourceType = null, resourceId = null, limit = 100, offset = 0 } = {}) {
  /** Query audit logs with filters and pagination. */
  const filter = {};
  if (actor) filter.actor = actor;
  if (action) filter.action = action;
  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = resourceId;

  const data = await AuditLog.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
  return data;
}

module.exports = {
  createAuditLog,
  queryAuditLogs,
};
