import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // College Reference
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    
    // User Reference (if student has account)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    
    // Student Information
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    
    // Academic Information
    course: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    cgpa: {
      type: Number,
      default: 0,
    },
    
    // Skills (stored as object with skill name and level)
    skills: {
      type: Map,
      of: Number,
      default: {},
    },
    
    // Social Links
    linkedin: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    
    // Achievements & Projects
    achievements: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    
    // Placement Status
    status: {
      type: String,
      enum: ["placed", "selected", "seeking", "offer-pending", "offer-rejected"],
      default: "seeking",
    },
    company: {
      type: String,
      default: "",
    },
    package: {
      type: String,
      default: "",
    },
    offerAccepted: {
      type: Boolean,
      default: false,
    },
    offerReason: {
      type: String,
      default: "",
    },
    offerDate: {
      type: Date,
    },
    
    // SpreadNext Related
    spreadnextRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isPremiumUser: {
      type: Boolean,
      default: false,
    },
    throughSpreadnext: {
      type: Boolean,
      default: false,
    },
    
    // Interview Statistics
    interviewStats: {
      totalApplied: {
        type: Number,
        default: 0,
      },
      interviews: {
        type: Number,
        default: 0,
      },
      offers: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      rejected: {
        type: Number,
        default: 0,
      },
    },
    
    // Dates
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ collegeId: 1, rollNo: 1 }, { unique: true });
studentSchema.index({ collegeId: 1, status: 1 });
studentSchema.index({ collegeId: 1, course: 1, branch: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ email: 1 });

export default mongoose.model("CollegeStudent", studentSchema);


