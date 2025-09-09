// server/models/FoodReview.js
const mongoose = require('mongoose');

/* ---------- Subschemas ---------- */
const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, required: true },
    // keep your existing client-side id scheme (header X-User-Id) as a string
    author: { type: String, trim: true, default: 'anonymous' }, // userId
    authorName: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ReportSchema = new mongoose.Schema(
  {
    userId: { type: String, trim: true, required: true },
    reason: {
      type: String,
      enum: ['spam', 'abusive', 'off-topic', 'plagiarism', 'advertising', 'other'],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ---------- Main schema ---------- */
const FoodReviewSchema = new mongoose.Schema(
  {
    // Main content
    title: { type: String, required: true, trim: true, minlength: 3 },
    description: { type: String, required: true, trim: true, minlength: 20 },
    rating: { type: Number, required: false, min: 1, max: 5 }, // No longer required
  imageUrl: { type: String, trim: true },
  images: { type: [String], default: [] },
    visitDate: { type: Date },

    // Denormalized metadata for filtering
    cuisine: { type: String, trim: true },
    area: { type: String, trim: true },
    diningStyle: { type: String, trim: true },
    price: { type: String, trim:true },
    tags: [{ type: String, trim: true }],

    // Author info (denormalized for display)
    authorId: { type: String, required: true, index: true },
    authorName: { type: String, trim: true },

    /* --- Reactions --- */
    likedBy: { type: [String], default: [] },    // userIds
    dislikedBy: { type: [String], default: [] }, // userIds
    likes: { type: Number, default: 0 },         // computed
    dislikes: { type: Number, default: 0 },      // computed

    /* --- Comments --- */
    comments: { type: [CommentSchema], default: [] },

    /* --- Reports / Moderation --- */
    // Backward compatible: earlier versions stored a number; now store array of reports.
    // Use Mixed to accept both and normalize in code.
    reports: { type: mongoose.Schema.Types.Mixed, default: [] },
    isRemoved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    // When updating likes/comments, don't re-validate the whole doc
    validateBeforeSave: false,
  }
);

/* ---------- Helpers / hooks ---------- */
// Single place to keep counters + moderation in sync
FoodReviewSchema.methods.syncCounters = function () {
  this.likes = Array.isArray(this.likedBy) ? this.likedBy.length : 0;
  this.dislikes = Array.isArray(this.dislikedBy) ? this.dislikedBy.length : 0;
  const r = this.reports;
  const repCount = Array.isArray(r) ? r.length : (typeof r === 'number' ? r : 0);
  this.reportsCount = repCount;

  if (!this.isRemoved && this.reportsCount >= 5) {
    this.isRemoved = true;
    this.removedAt = new Date();
  }
  return this;
};

// convenience for controllers
FoodReviewSchema.methods.canDelete = function (userId) {
  return String(this.authorId) === String(userId);
};

// Keep counters in sync on create/save
FoodReviewSchema.pre('save', function (next) {
  this.syncCounters();
  next();
});

/* ---------- Indexes ---------- */
// Broaden text search to more fields users actually query
FoodReviewSchema.index({
  title: 'text',
  description: 'text',
  cuisine: 'text',
  area: 'text',
  diningStyle: 'text',
  tags: 'text',
});

module.exports = mongoose.model('FoodReview', FoodReviewSchema);
