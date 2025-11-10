const mongoose = require('mongoose');

const RoleAssignmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      required: true,
      enum: ['employee', 'manager', 'admin'],
      index: true,
    },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
    collection: 'role_assignments',
  }
);

// A user can only have a single assignment per role
RoleAssignmentSchema.index({ user: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('RoleAssignment', RoleAssignmentSchema);
