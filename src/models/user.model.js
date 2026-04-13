import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    mobileNo: { type: String, required: false, unique: true, sparse: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: {
  type: String,
  required: function () {
    return this.authProvider === "local";
  },
},
    rememberMe: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    firebaseUid: { type: String },
authProvider: {
  type: String,
  enum: ["local", "google"],
  default: "local",
},
role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  lastLogin: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
    isPremium: { type: Boolean, default: false } // Premium membership status
  },
  { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
}
);


userSchema.virtual('profile', {
  ref: 'Profile',         // Profile model ka naam
  localField: '_id',      // User model ki ID
  foreignField: 'userId', // Profile model mein jo field hai
  justOne: true           // Kyunki 1 user ki 1 hi profile hogi
});

export default mongoose.model("User", userSchema);
