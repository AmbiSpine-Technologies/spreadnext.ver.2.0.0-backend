import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    title: {
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
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "collaborator", "viewer"],
          default: "collaborator",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "pending", "left"],
          default: "pending",
        },
      },
    ],
    category: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
collaborationSchema.index({ creator: 1, createdAt: -1 });
collaborationSchema.index({ status: 1, createdAt: -1 });
collaborationSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Collaboration", collaborationSchema);









