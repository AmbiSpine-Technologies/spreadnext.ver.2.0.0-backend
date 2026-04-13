import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
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
    
    // Company Details
    website: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    orgType: {
      type: String,
      enum: ["public", "self-employed", "gov", "non-profit", "private", "partnership"],
      required: true,
    },
    orgSize: {
      type: String,
      enum: ["0-1", "2-10", "11-50", "51-200", "201-500", "501-1000"],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    headquarters: {
      type: String,
      default: "",
    },
    founded: {
      type: String,
      default: "",
    },
    specialties: {
      type: [String],
      default: [],
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
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    altEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
companySchema.index({ name: "text", industry: "text", description: "text" });
companySchema.index({ email: 1 });
companySchema.index({ createdBy: 1 });
companySchema.index({ isVerified: 1, isActive: 1 });
companySchema.index({ followers: -1 });

export default mongoose.model("Company", companySchema);


