const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
      unique: true,
      // ← remove index: true from here
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    scheduledAt: {
      type: Date,
      required: [true, "Session date and time is required"],
    },
    duration: {
      type: Number, // in minutes
      default: 60,
      min: 15,
      max: 480,
    },
    meetingLink: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["proposed", "confirmed", "rejected", "completed", "cancelled"],
      default: "proposed",
    },
    // Which skill is being taught in this session
    skillBeingTaught: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      default: null,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ conversation: 1 });
sessionSchema.index({ participants: 1, scheduledAt: 1 });
sessionSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model("Session", sessionSchema);
