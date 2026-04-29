import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: [
      "Account / Profile", "Jobs & Applications", "Technical Issue", 
      "Billing & Subscriptions", "Recruiter Solution", "Campus Solution", 
      "Income Tax Consultancy", "GST Registration", "Other"
    ]
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  attachmentKey: { type: String }, // S3 key store hogi
  status: { 
    type: String, 
    enum: ["Open", "In-Progress", "Resolved"], 
    default: "Open" 
  }
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);