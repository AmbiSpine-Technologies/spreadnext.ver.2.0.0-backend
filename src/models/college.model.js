import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    
    // College Details
    type: {
      type: String,
      enum: ["Private University", "Public University", "College", "Institute"],
      default: "College",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    established: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    
    // Media
    logo: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    
    // Contact Information
    contactPersonName: {
      type: String,
      default: "",
    },
    contactNumber: {
      type: String,
      default: "",
    },
    altEmail: {
      type: String,
      default: "",
    },
    
    // Verification
    verificationDoc: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    // Social Stats
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    
    // Relations
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
collegeSchema.index({ name: "text", city: "text", description: "text" });
collegeSchema.index({ email: 1 });
collegeSchema.index({ createdBy: 1 });
collegeSchema.index({ isVerified: 1, isActive: 1 });
collegeSchema.index({ followers: -1 });

export default mongoose.model("College", collegeSchema);


