const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Skill title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [80, "Title cannot exceed 80 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Technology",
        "Design",
        "Music",
        "Language",
        "Cooking",
        "Fitness",
        "Business",
        "Arts & Crafts",
        "Academic",
        "Other",
      ],
    },
    type: {
      type: String,
      enum: ["teach", "learn"],
      required: [true, "Skill type (teach/learn) is required"],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    creditCost: {
      type: Number,
      required: [true, "Credit cost is required"],
      min: [0, "Minimum credit cost is 1"],
      max: [20, "Maximum credit cost is 20"],
      default: 3,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isLearned: {
      type: Boolean,
      default: false,
    },
    learnedAt: {
      type: Date,
      default: null,
    },
    // Engagement stats — denormalized for fast reads
    stats: {
      views: { type: Number, default: 0 },
      requestCount: { type: Number, default: 0 },
      completedSwaps: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ──────────────────────────────────────────────
skillSchema.index({ category: 1 });
skillSchema.index({ type: 1 });
skillSchema.index({ tags: 1 });
skillSchema.index({ creditCost: 1 });
// Compound — most common browse query: active teach skills by category
skillSchema.index({ type: 1, category: 1, isActive: 1 });
// Text search across title + description
skillSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Skill", skillSchema);
