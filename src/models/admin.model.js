import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "moderator", "company_admin", "college_admin"],
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          // User Management
          "view_users",
          "edit_users",
          "suspend_users",
          "delete_users",
          
          // Job Management
          "view_jobs",
          "approve_jobs",
          "reject_jobs",
          "feature_jobs",
          "delete_jobs",
          
          // Applications
          "view_applications",
          "update_application_status",
          "view_assessments",
          
          // Company Management
          "view_companies",
          "verify_companies",
          "suspend_companies",
          "edit_company_info",
          
          // College Management
          "view_colleges",
          "verify_colleges",
          "suspend_colleges",
          "edit_college_info",
          
          // Content Moderation
          "view_reports",
          "moderate_content",
          "delete_posts",
          "delete_comments",
          
          // Analytics
          "view_analytics",
          "view_reports",
          "export_data",
          
          // System Settings
          "manage_settings",
          "manage_admins",
          "view_audit_logs",
          "send_notifications",
        ],
      },
    ],
    department: {
      type: String,
      enum: ["moderation", "support", "operations", "analytics"],
      default: "operations",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    assignedCompanies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
    assignedColleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
      },
    ],
    activityLog: [
      {
        action: String,
        targetType: String, // User, Job, Company, etc.
        targetId: mongoose.Schema.Types.ObjectId,
        timestamp: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
    lastLogin: Date,
    notes: String,
  },
  { timestamps: true }
);

// Index for quick lookups
adminSchema.index({ userId: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });
adminSchema.index({ createdAt: -1 });

export default mongoose.model("Admin", adminSchema);
