import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // For nested comments/replies
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
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
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ isDeleted: 1 });

commentSchema.methods.incrementLikes = function () {
  this.likesCount += 1;
  return this.save();
};

commentSchema.methods.decrementLikes = function () {
  this.likesCount = Math.max(0, this.likesCount - 1);
  return this.save();
};

commentSchema.methods.incrementReplies = function () {
  this.repliesCount += 1;
  return this.save();
};

commentSchema.methods.decrementReplies = function () {
  this.repliesCount = Math.max(0, this.repliesCount - 1);
  return this.save();
};

export default mongoose.model("Comment", commentSchema);

