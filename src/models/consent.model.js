// models/consent.model.js
import mongoose from "mongoose";

const consentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
   anonId: {
    type: String,
    index: true,
  },
  analytics: Boolean,
  marketing: Boolean,
  status: String,
}, { timestamps: true });

export default mongoose.model("Consent", consentSchema);