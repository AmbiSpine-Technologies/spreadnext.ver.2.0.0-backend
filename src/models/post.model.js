import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: { type: String, enum: ["image", "video"], required: true },
        url: { type: String, required: true },
        thumbnail: { type: String }, // For videos
      },
    ],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      type: {
        type: String,
        enum: ["like", "love", "laugh", "angry", "sad"],
        required: true,
        default: "like",
      },
    },
  ],

  reactionCount: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
  },

    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    repostsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    privacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isDeleted: 1, createdAt: -1 });
postSchema.index({ content: "text" }); // Text search

postSchema.methods.incrementLikes = function () {
  this.likesCount += 1;
  return this.save();
};

postSchema.methods.decrementLikes = function () {
  this.likesCount = Math.max(0, this.likesCount - 1);
  return this.save();
};

postSchema.methods.incrementComments = function () {
  this.commentsCount += 1;
  return this.save();
};

postSchema.methods.decrementComments = function () {
  this.commentsCount = Math.max(0, this.commentsCount - 1);
  return this.save();
};

postSchema.methods.incrementReposts = function () {
  this.repostsCount += 1;
  return this.save();
};

postSchema.methods.decrementReposts = function () {
  this.repostsCount = Math.max(0, this.repostsCount - 1);
  return this.save();
};

export default mongoose.model("Post", postSchema);

