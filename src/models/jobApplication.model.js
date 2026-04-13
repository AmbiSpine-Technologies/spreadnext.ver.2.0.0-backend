import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

resume: {
      key: { type: String, required: true },
      url: { type: String, required: true },
    },


    resumeUrl: {
      type: String,
      default: "",
    },
    experience: { type: String },
  currentCtc: { type: String },
  expectedCtc: { type: String },
  noticePeriod: { type: String },
    coverLetter: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "interview", "rejected", "accepted", "withdrawn"],
      default: "pending",
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    // Additional application data
    answers: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    }, // Match score between applicant profile and job requirements
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
jobApplicationSchema.index({ applicant: 1, status: 1, appliedAt: -1 });
jobApplicationSchema.index({ job: 1, status: 1, appliedAt: -1 });

export default mongoose.model("JobApplication", jobApplicationSchema);

