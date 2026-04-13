import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
 questions: [{
    id: Number,
    question: String,
    options: [String],
    correctAnswer: Number
  }],
  answers: [{
    questionId: String,
    selectedAnswer: Number,
    isCorrect: Boolean,
  }],
    score: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    correctAnswers: Number,
    
    totalQuestions: Number,
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);
