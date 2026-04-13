import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      default: "",
    },
website: { type: String, default: "" },
    companyEmail: { type: String, default: "" },
    companyProfile: { type: String, default: "" },
    applyEmail: { type: String, default: "" },
    applyLink: { type: String, default: "" },
    companyColor: {
      type: String,
      default: "bg-blue-600",
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      required: true,
    },
    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      required: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
      required: true,
    },
    education: {
      type: String,
      enum: ["High School", "Bachelor's", "Master's", "PhD", "Any"],
      default: "Any",
    },
    experience: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      required: true,
    },
    responsibilities: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    companySize: {
      type: String,
      enum: ["Startup", "Mid-size", "Large", "Enterprise"],
      default: "Mid-size",
    },
    industry: {
      type: String,
      default: "Technology",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
jobSchema.index({ title: "text", company: "text", skills: "text" });
jobSchema.index({ location: 1, workMode: 1, jobType: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("Job", jobSchema);
