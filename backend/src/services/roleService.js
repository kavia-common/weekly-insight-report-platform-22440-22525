const roleRepo = require('../repositories/roleAssignmentRepository');
const auditRepo = require('../repositories/auditLogRepository');

// PUBLIC_INTERFACE
async function assignRole(userId, role, actorContext = null) {
  /** Assign a role and create an audit entry. */
  const res = await roleRepo.assignRole({ userId, role, assignedBy: actorContext?.actor || null });
  await auditRepo.createAuditLog({
    actor: actorContext?.actor || null,
    action: 'role.assign',
    resourceType: 'RoleAssignment',
    resourceId: res?._id?.toString?.() || null,
    metadata: { role },
  });
  return res;
}

// PUBLIC_INTERFACE
async function revokeRole(userId, role, actorContext = null) {
  /** Revoke a role and create an audit entry. */
  const ok = await roleRepo.revokeRole({ userId, role });
  if (ok) {
    await auditRepo.createAuditLog({
      actor: actorContext?.actor || null,
      action: 'role.revoke',
      resourceType: 'RoleAssignment',
      resourceId: null,
      metadata: { role },
    });
  }
  return ok;
}

module.exports = {
  assignRole,
  revokeRole,
};
