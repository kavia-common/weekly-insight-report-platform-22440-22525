const Report = require('../models/report');
const mongoose = require('mongoose');

// PUBLIC_INTERFACE
async function createDraft({ userId, weekStart, content = {} }) {
  /** Create a draft report for the user for a given weekStart. */
  const report = await Report.create({
    user: new mongoose.Types.ObjectId(userId),
    weekStart,
    status: 'draft',
    current: content,
    versions: [{ version: 1, content }],
  });
  return report.toObject();
}

// PUBLIC_INTERFACE
async function saveDraft(reportId, content) {
  /** Save changes to a draft (adds a new version). */
  const report = await Report.findById(reportId);
  if (!report) return null;
  if (report.status !== 'draft') {
    throw new Error('Cannot edit a submitted report');
  }
  const nextVersion = (report.versions?.length || 0) + 1;
  report.current = content;
  report.versions.push({ version: nextVersion, content });
  await report.save();
  return report.toObject();
}

// PUBLIC_INTERFACE
async function submitReport(reportId) {
  /** Mark a draft as submitted. Enforces unique constraint by user + week. */
  const report = await Report.findById(reportId);
  if (!report) return null;
  if (report.status === 'submitted') return report.toObject();

  report.status = 'submitted';
  report.submittedAt = new Date();
  try {
    await report.save(); // will throw if a submitted report already exists for same user+yearWeek
  } catch (e) {
    if (e && e.code === 11000) {
      const err = new Error('A submitted report for this user and week already exists.');
      err.code = 'DUPLICATE_SUBMITTED_WEEK';
      throw err;
    }
    throw e;
  }

  return report.toObject();
}

// PUBLIC_INTERFACE
async function getReportById(id) {
  /** Retrieve a report by id. */
  return await Report.findById(id).lean();
}

// PUBLIC_INTERFACE
async function listReportsByUser(userId, { limit = 50, offset = 0 } = {}) {
  /** List reports for a user ordered by createdAt desc. */
  return await Report.find({ user: userId }).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
}

// PUBLIC_INTERFACE
async function findDraftByUserAndWeek(userId, weekStart) {
  /** Find an existing draft for a specific user + weekStart. */
  return await Report.findOne({ user: userId, weekStart, status: 'draft' }).lean();
}

module.exports = {
  createDraft,
  saveDraft,
  submitReport,
  getReportById,
  listReportsByUser,
  findDraftByUserAndWeek,
};
