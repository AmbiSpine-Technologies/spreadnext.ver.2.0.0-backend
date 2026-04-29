import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  institutionName: String,
  role: String,
  requirement: String,
  institutionType: String,
  teamSize: String,
  message: String,
  // Hidden Smart Fields
  sourceUrl: String,      // Captures: Source page URL
  pageTitle: String,      // Captures: Page title
  campaignSource: String, // Captures: Campaign source (UTM params)
  deviceType: String,     // Captures: Device type (Mobile/Desktop)
  country: String,        // Captures: Country / region
userip: {
    type: String,
    trim: true,
    default: "0.0.0.0"
  },
}, { timestamps: true });

export default mongoose.model("Requirement", requirementSchema);