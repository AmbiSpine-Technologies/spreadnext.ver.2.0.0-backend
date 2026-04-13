import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      type: { type: String, enum: ["image", "video"], required: true },
      url: { type: String, required: true },
      thumbnail: { type: String }, // For videos
    },
    caption: {
      type: String,
      default: "",
      trim: true,
    },
    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
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

// Index for finding active stories
storySchema.index({ author: 1, expiresAt: 1, isDeleted: 1 });
storySchema.index({ expiresAt: 1 }); // For cleanup job

storySchema.methods.addViewer = function (userId) {
  const alreadyViewed = this.viewers.some(
    (viewer) => viewer.user.toString() === userId.toString()
  );

  if (!alreadyViewed) {
    this.viewers.push({ user: userId, viewedAt: new Date() });
    this.viewsCount += 1;
    return this.save();
  }

  return Promise.resolve(this);
};

export default mongoose.model("Story", storySchema);

