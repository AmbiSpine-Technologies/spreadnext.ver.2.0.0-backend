import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    privacy: {
      type: String,
      enum: ["public", "private", "restricted"],
      default: "public",
    },
    category: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
      },
    ],
    rules: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
      },
    ],
    settings: {
      allowMemberPosts: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      allowFileUploads: { type: Boolean, default: true },
      allowEvents: { type: Boolean, default: true },
    },
    membersCount: {
      type: Number,
      default: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
communitySchema.index({ name: "text", description: "text", tags: "text" });
communitySchema.index({ creator: 1, createdAt: -1 });
communitySchema.index({ privacy: 1, isActive: 1 });

export default mongoose.model("Community", communitySchema);









