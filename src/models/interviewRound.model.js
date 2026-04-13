// models/InterviewRound.js
import mongoose from "mongoose";

const interviewRoundSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
      index: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    roundName: {
      type: String,
      required: true,
      // enum: ["resume_screening", "technical_round", "system_design", "managerial", "hr_round", "custom"],
    },
    customRoundName: {
      type: String,
      trim: true,
    },
    interviewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: String,
        email: String,
        role: String,
        feedback: String,
        rating: Number,
        submittedAt: Date,
      },
    ],
    scheduledDate: Date,
    scheduledTime: String,
    meetingLink: String,
    duration: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "cancelled", "no_show"],
      default: "pending",
    },
    feedback: {
      technicalSkills: Number,
      communication: Number,
      problemSolving: Number,
      culturalFit: Number,
      overallRating: Number,
      strengths: String,
      weaknesses: String,
      notes: String,
      recommendation: String,
    },
    decision: {
      type: String,
      enum: ["pending", "selected", "rejected", "on_hold"],
      default: "pending",
    },
    completedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

interviewRoundSchema.index({ application: 1, roundNumber: 1 }, { unique: true });

export default mongoose.model("InterviewRound", interviewRoundSchema);