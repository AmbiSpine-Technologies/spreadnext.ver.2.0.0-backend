import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'onModel' 
  },
  onModel: { type: String, required: true, enum: ['Company', 'College'] },
  
  designation: { type: String, required: true }, // e.g. "HR Manager", "Placement Head"
  workEmail: { type: String, lowercase: true },
  
  permissions: {
    type: [String], 
    default: ['basic_access', 'view_dashboard'] // e.g. ['post_job', 'view_student_data', 'manage_team']
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected', 'left'], 
    default: 'pending' 
  }
}, { timestamps: true });

// Index for fast lookup: "Which companies does this user belong to?"
memberSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
export default mongoose.model("Member", memberSchema);