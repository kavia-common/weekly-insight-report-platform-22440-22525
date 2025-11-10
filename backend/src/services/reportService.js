const reportRepo = require('../repositories/reportRepository');
const auditRepo = require('../repositories/auditLogRepository');

// PUBLIC_INTERFACE
async function createOrUpdateDraft({ userId, weekStart, content, actorContext = null }) {
  /** Create a draft or update existing one for the same week. */
  let draft = await reportRepo.findDraftByUserAndWeek(userId, weekStart);
  if (!draft) {
    draft = await reportRepo.createDraft({ userId, weekStart, content });
    await auditRepo.createAuditLog({
      actor: actorContext?.actor || null,
      action: 'report.create',
      resourceType: 'Report',
      resourceId: draft._id?.toString?.() || null,
      metadata: { weekStart },
    });
  } else {
    draft = await reportRepo.saveDraft(draft._id, content);
    await auditRepo.createAuditLog({
      actor: actorContext?.actor || null,
      action: 'report.update',
      resourceType: 'Report',
      resourceId: draft._id?.toString?.() || null,
    });
  }
  return draft;
}

// PUBLIC_INTERFACE
async function submit(reportId, actorContext = null) {
  /** Submit a draft report; enforces uniqueness at DB layer. */
  const submitted = await reportRepo.submitReport(reportId);
  await auditRepo.createAuditLog({
    actor: actorContext?.actor || null,
    action: 'report.submit',
    resourceType: 'Report',
    resourceId: submitted._id?.toString?.() || null,
  });
  return submitted;
}

module.exports = {
  createOrUpdateDraft,
  submit,
};
