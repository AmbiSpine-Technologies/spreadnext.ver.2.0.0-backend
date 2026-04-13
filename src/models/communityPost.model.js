import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: { type: String, enum: ["image", "video"], required: true },
        url: { type: String, required: true },
        thumbnail: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["published", "pending", "rejected"],
      default: "published",
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
communityPostSchema.index({ community: 1, createdAt: -1 });
communityPostSchema.index({ community: 1, isPinned: -1, createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model("CommunityPost", communityPostSchema);









