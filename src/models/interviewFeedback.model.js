// models/InterviewFeedback.js
import mongoose from "mongoose";

const interviewFeedbackSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewRound",
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    roundName: {
      type: String,
      required: true,
    },
    
    // Feedback Provider Details
    feedbackProvider: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["interviewer", "hiring_manager", "recruiter", "tech_lead", "hr"],
        default: "interviewer",
      },
      department: String,
    },
    
    // Comprehensive Ratings
    ratings: {
      technicalSkills: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      problemSolving: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      culturalFit: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      leadership: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      teamwork: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      adaptability: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      overallRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
    },
    
    // Detailed Feedback
    feedback: {
      strengths: {
        type: String,
        required: true,
        trim: true,
      },
      weaknesses: {
        type: String,
        trim: true,
      },
      technicalObservations: {
        type: String,
        trim: true,
      },
      behavioralObservations: {
        type: String,
        trim: true,
      },
      additionalNotes: {
        type: String,
        trim: true,
      },
      recommendations: {
        type: String,
        trim: true,
      },
    },
    
    // Decision
    decision: {
      type: String,
      enum: ["strong_hire", "hire", "consider", "no_hire", "on_hold"],
      required: true,
    },
    
    // Status
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed", "approved"],
      default: "submitted",
    },
    
    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    
    // For analytics
    tags: [String],
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
interviewFeedbackSchema.index({ candidate: 1, roundNumber: -1 });
interviewFeedbackSchema.index({ application: 1, round: 1 });
interviewFeedbackSchema.index({ feedbackProvider: 1, submittedAt: -1 });

export default mongoose.model("InterviewFeedback", interviewFeedbackSchema);