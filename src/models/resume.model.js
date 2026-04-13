import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    template: {
      type: String,
      enum: ["modern", "classic", "professional", "creative", "executive"],
      default: "modern",
    },
    title: {
      type: String,
      default: "My Resume",
      trim: true,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed, 
      default: {},
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    shareToken: {
      type: String,
      default: "",
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ shareToken: 1 });

export default mongoose.model("Resume", resumeSchema);









