import mongoose from "mongoose";

const communityChatSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    media: {
      type: { type: String, enum: ["image", "video", "file"] },
      url: { type: String },
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
communityChatSchema.index({ community: 1, createdAt: -1 });
communityChatSchema.index({ sender: 1, createdAt: -1 });

export default mongoose.model("CommunityChat", communityChatSchema);









