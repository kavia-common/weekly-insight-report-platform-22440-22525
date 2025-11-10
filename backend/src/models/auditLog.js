const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    action: {
      type: String,
      required: true,
      enum: [
        'user.login',
        'user.logout',
        'report.create',
        'report.update',
        'report.submit',
        'role.assign',
        'role.revoke',
        'seed.run',
      ],
      index: true,
    },
    resourceType: { type: String, default: null, index: true },
    resourceId: { type: String, default: null, index: true },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    metadata: { type: Object, default: {} },
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
