const RoleAssignment = require('../models/roleAssignment');

// PUBLIC_INTERFACE
async function assignRole({ userId, role, assignedBy = null }) {
  /** Assign a role to a user. Idempotent per (user,role) unique index. */
  const doc = await RoleAssignment.findOneAndUpdate(
    { user: userId, role },
    { user: userId, role, assignedBy, assignedAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  return doc;
}

// PUBLIC_INTERFACE
async function revokeRole({ userId, role }) {
  /** Revoke a specific role from a user. */
  const res = await RoleAssignment.deleteOne({ user: userId, role });
  return res.deletedCount > 0;
}

// PUBLIC_INTERFACE
async function getUserRoles(userId) {
  /** Return a list of roles assigned to a user. */
  const roles = await RoleAssignment.find({ user: userId }).select('role').lean();
  return roles.map((r) => r.role);
}

module.exports = {
  assignRole,
  revokeRole,
  getUserRoles,
};
