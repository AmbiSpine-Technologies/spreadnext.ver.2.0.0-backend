import mongoose from "mongoose";

const repostSchema = new mongoose.Schema(
  {
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reposts
repostSchema.index({ user: 1, originalPost: 1 }, { unique: true });
repostSchema.index({ originalPost: 1, createdAt: -1 });

export default mongoose.model("Repost", repostSchema);

