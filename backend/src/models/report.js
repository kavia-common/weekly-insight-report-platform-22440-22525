const mongoose = require('mongoose');

/**
 * Helper to derive a "year-week" identifier (ISO week).
 * We store a yearWeek string to enable a unique index for submitted reports.
 */
function computeYearWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Thursday in current week decides the year.
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  // First day of year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // ISO week number
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  const year = date.getUTCFullYear();
  const two = (n) => String(n).padStart(2, '0');
  return `${year}-W${two(weekNo)}`;
}

const VersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    content: {
      type: Object,
      required: true, // structured content {progress, blockers, plans, notes}
    },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // weekStart helps anchoring the report to a specific week (e.g., Monday)
    weekStart: { type: Date, required: true },
    yearWeek: { type: String, required: true, index: true }, // computed: YYYY-Www
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft',
      index: true,
    },
    current: {
      type: Object,
      required: true,
      default: {},
    },
    versions: {
      type: [VersionSchema],
      default: [],
    },
    submittedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'reports',
  }
);

// Ensure computed field is set
ReportSchema.pre('validate', function preValidate(next) {
  try {
    if (this.weekStart) {
      const d = new Date(this.weekStart);
      if (isNaN(d.getTime())) {
        return next(new Error('weekStart must be a valid date'));
      }
      this.yearWeek = computeYearWeek(d);
    }
    // Versions management: ensure version numbers are sequential
    if (Array.isArray(this.versions)) {
      this.versions.sort((a, b) => a.version - b.version);
      this.versions.forEach((v, idx) => {
        if (typeof v.version !== 'number') {
          v.version = idx + 1;
        }
      });
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Unique constraint: only one SUBMITTED report per user per week.
// Implemented with a partial index on status: 'submitted'
ReportSchema.index(
  { user: 1, yearWeek: 1 },
  { unique: true, partialFilterExpression: { status: 'submitted' } }
);

// Helpful query indexes
ReportSchema.index({ user: 1, createdAt: -1 });
ReportSchema.index({ yearWeek: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);
