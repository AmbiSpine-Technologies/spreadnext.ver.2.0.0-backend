import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["accepted", "pending", "blocked"],
      default: "accepted",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate connections
connectionSchema.index({ follower: 1, following: 1 }, { unique: true });
connectionSchema.index({ following: 1, status: 1 });
connectionSchema.index({ follower: 1, status: 1 });

export default mongoose.model("Connection", connectionSchema);









