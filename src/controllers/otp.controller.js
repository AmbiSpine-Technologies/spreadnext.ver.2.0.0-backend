import { sendOTP, verifyOTP, HRorTPOsendOTP, HRprTPOverifyOTP , sendPasswordResetOTP } from "../services/otp.service.js";
import { createOrUpdateProfile } from "../services/profile.service.js";
import User from "../models/user.model.js";
import { generateResetToken } from "../utils/jwt.js";
import OTP from '../models/otp.model.js';

import Member from "../models/member.model.js";
import { createActivityService } from "../services/activity.service.js";
import Notification from "../models/notification.model.js";


export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const result = await sendOTP(email);
    
    if (result.success) {
    res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (err) {
    console.error("OTP ERROR:", err); 
    res.status(500).json({ 
      success: false,
      message: "Failed to send OTP", 
      error: err.message 
    });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      // Logic: Generate a temporary token or session here if needed
      res.status(200).json({ success: true, message: "Verification successful" });
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// password otp sent controller 
export const passwordSendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    await sendPasswordResetOTP(email, otp);

    res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const HRorTPOOtpController = async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    // FIX 1: Always convert to lowercase for consistency
    const emailLower = email.toLowerCase().trim();
    if (type === 'hr' && !emailLower.startsWith('hr')) {
      return res.status(400).json({ success: false, message: "HR email must start with 'hr'" });
    }
    if (type === 'tpo' && !emailLower.startsWith('tpo')) {
      return res.status(400).json({ success: false, message: "College TPO email must start with 'tpo'" });
    }

    // Pass the lowercase email to the sender function
    const result = await HRorTPOsendOTP(emailLower, type); 
    res.status(result.success ? 200 : 500).json(result);

  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


// export const HRorTPOverifyOtpController = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ message: "Email and OTP are required" });
//     }

//     const emailLower = email.toLowerCase().trim();

//     // 1. Verify OTP
//     const result = await HRprTPOverifyOTP(emailLower, otp.toString());
    
//     if (result.success) {
//         // 2. Identify User
//         let userId = req.user?._id;
        
//         // Agar authMiddleware ne req.user nahi diya, toh email se User find karein
//         if (!userId) {
//             const user = await User.findOne({ email: emailLower });
//             if (user) userId = user._id;
//         }

//         if (userId) {
//             // 3. Logic: Decide Journey Type here in Controller
//             let journeyType = "Recruiter"; // Default
//             if (emailLower.startsWith("hr")) {
//                 journeyType = "Recruiter";
//             } else if (emailLower.startsWith("tpo")) {
//                 journeyType = "TPO";
//             }

//             console.log("🎯 Journey Type Decided in Controller:", journeyType);

//             // 4. Call Service with specific data
//             const profileResult = await createOrUpdateProfile(userId, {
//                 personalInfo: {
//                     email: emailLower,
//                     journeyType: journeyType, // Controller ne pass kiya
//                 },
//             });
            
//             console.log("✅ Profile Sync Result:", profileResult.success);
//         } else {
//             console.log("⚠️ OTP Verified but no User found to update profile.");
//         }
        
//         return res.status(200).json({ success: true, message: "OTP Verified Successfully" });
//     }

//     return res.status(400).json(result);

//   } catch (err) {
//     console.error("Verification Error:", err);
//     res.status(500).json({ message: "OTP verification failed (Server Error)" });
//   }
// };



export const HRorTPOverifyOtpController = async (req, res) => {
  try {
    const { email, otp, orgId, designation, onModel } = req.body; 
    const emailLower = email.toLowerCase().trim();
    const userId = req.user?._id;

    // 1. Verify OTP
    const result = await HRprTPOverifyOTP(emailLower, otp.toString());
    console.log(result);
    if (!result.success) return res.status(400).json(result);

    // 2. Decide Journey Type & Save to Profile
    const journeyType = emailLower.startsWith("hr") ? "Recruiter" : "TPO";

    // ✅ FIX: Explicitly profile update with Journey Type
    await Profile.findOneAndUpdate(
        { userId },
        { $set: { "personalInfo.journeyType": journeyType, "personalInfo.email": emailLower } },
        { upsert: true }
    );

    // 3. Create Membership Link (Hierarchy Management)
    // Isse pata chalega ki ye user is Company ka HR hai
    const member = await Member.findOneAndUpdate(
      { userId, organizationId: orgId },
      { 
        onModel, // 'Company' or 'College'
        designation, 
        workEmail: emailLower,
        status: 'pending' 
      },
      { upsert: true, new: true }
    );
    console.log("member", member);
    // 4. Activity Log (Actor: HR)
    await createActivityService({
      user: userId,
      type: journeyType === "Recruiter" ? "hr_verification_requested" : "profile_updated",
      targetType: onModel,
      targetId: orgId,
      metadata: { designation, email: emailLower }
    });

    // 5. Notification to Org Admin
    const org = await mongoose.model(onModel).findById(orgId);
    if (org && org.createdBy) {
      await Notification.create({
        user: org.createdBy,
        type: "verification_request",
        actor: userId,
        targetType: onModel,
        targetId: orgId,
        metadata: { message: `New ${journeyType} request for ${org.name}` }
      });
    }

    return res.status(200).json({ 
        success: true, 
        message: "OTP Verified & Request Sent to Admin",
        journeyType 
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error during verification" });
  }
};