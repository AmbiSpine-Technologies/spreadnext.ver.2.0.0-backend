import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },

  status: {
    type: String,
    enum: ["subscribed", "unsubscribed"],
    default: "subscribed",
  },
  source: { type: String, default: "footer" },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: Date,
  emailsSent: { type: Number, default: 0 },
  lastEmailSentAt: Date,
}, { timestamps: true });

export default mongoose.model("Subscriber", subscriberSchema);