import mongoose from "mongoose";

const uploadedFileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "document"],
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    relatedTo: {
      type: String,
      enum: ["Post", "Story", "Profile", "Resume", "Job", "Community", null],
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

uploadedFileSchema.index({ uploadedBy: 1, createdAt: -1 });
uploadedFileSchema.index({ type: 1 });
uploadedFileSchema.index({ relatedTo: 1, relatedId: 1 });

export default mongoose.model("UploadedFile", uploadedFileSchema);

