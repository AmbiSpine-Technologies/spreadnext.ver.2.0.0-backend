import dotenv from "dotenv";
dotenv.config();
import Profile from "../models/profile.model.js";
import OTP from "../models/otp.model.js";
import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error("⚠️  WARNING: EMAIL_USER or EMAIL_APP_PASSWORD not set in .env file");
  console.error("Please set these variables to enable email functionality:");
  console.error("EMAIL_USER=your-email@gmail.com");
  console.error("EMAIL_APP_PASSWORD=your-app-password");
} else {
  console.log("✅ Email credentials loaded from .env");
  console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
  console.log(`🔑 App Password: ${process.env.EMAIL_APP_PASSWORD ? '***' + process.env.EMAIL_APP_PASSWORD.slice(-4) : 'NOT SET'}`);
}

let transporter;
try {
  transporter = nodemailer.createTransport({
  service: "gmail",
  // host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_APP_PASSWORD,
  },
    secure: true,
    tls: {
      rejectUnauthorized: false
    }
});
  console.log("✅ Nodemailer transporter created successfully");
} catch (error) {
  console.error("❌ Error creating transporter:", error);
}

const otpStore = {}; 

export const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);  

  otpStore[email] = otp;
  
  const otpExpiry = Date.now() + 10 * 60 * 1000; 
  otpStore[`${email}_expiry`] = otpExpiry;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "SpreadNext Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0038FF;">SpreadNext Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #0038FF; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">${otp}</h1>
        <p style="color: #666;">This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
        <p style="color: #666; margin-top: 20px;">Best regards,<br>The SpreadNext Team</p>
      </div>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("❌ Email credentials not configured");
      return { 
        success: false, 
        message: "Email service not configured. Please contact administrator." 
      };
    }

    if (!transporter) {
      console.error("❌ Email transporter not initialized");
      return { 
        success: false, 
        message: "Email service not properly initialized." 
      };
    }

    console.log(`📤 Attempting to send OTP to: ${email}`);
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
    return { success: true, message: "OTP sent successfully to your email", email };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    
    if (error.code === 'EAUTH') {
      
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
       
        
        return { 
          success: true, 
          message: `OTP generated (email failed - check console for OTP code): ${otp}`, 
          email,
          developmentMode: true,
          otp: otp
        };
      }
      
      return { 
        success: false, 
        message: "Email authentication failed. Please verify your Gmail App Password is correct. Check server logs for detailed instructions." 
      };
    }
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      
      
      return { 
        success: true, 
        message: `OTP generated (email failed - check console for OTP code): ${otp}`, 
        email,
        developmentMode: true,
        otp: otp
      };
    }
    
    return { 
      success: false, 
      message: error.message || "Failed to send verification email. Please try again later." 
    };
  }
};


export const sendPasswordResetOTP = async (email) => {
  try {
    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save in DB (expires in 10 min)
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: "reset"
    });

    // 3. Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    // 4. Send Email (Styled)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password - SpreadNext",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #0038FF;">Password Reset Request</h2>

          <p>You requested to reset your password.</p>

          <h1 style="
            color: #0038FF;
            font-size: 32px;
            letter-spacing: 5px;
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;">
            ${otp}
          </h1>

          <p style="color: #666;">
            This OTP is valid for 10 minutes.
          </p>

          <p style="color: #666;">
            If you didn’t request this, you can safely ignore this email.
          </p>

          <p style="margin-top: 20px;">
            — SpreadNext Team
          </p>
        </div>
      `
    });

    return { success: true, message: "OTP sent successfully" };

  } catch (error) {
    console.error("OTP Error:", error);
    return { success: false, message: "Failed to send OTP" };
  }
};

export const HRorTPOsendOTP = async (email, type) => {
  const otp = Math.floor(100000 + Math.random() * 900000);  
  const isHR = email.toLowerCase().startsWith('hr');
  otpStore[email] = otp;
  
  const otpExpiry = Date.now() + 10 * 60 * 1000; 
  otpStore[`${email}_expiry`] = otpExpiry;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: isHR ? "HR Portal Verification Code" : "TPO College Verification Code",
    html: `
     <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #0013E3;">${isHR ? 'HR' : 'TPO'} Verification</h2>
        <p>Please use the code below to verify your account:</p>
        <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px;">
          ${otp}
        </div>
        <p>This code is valid for 10 minutes.</p>
      </div>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("❌ Email credentials not configured");
      return { 
        success: false, 
        message: "Email service not configured. Please contact administrator." 
      };
    }

    if (!transporter) {
      console.error("❌ Email transporter not initialized");
      return { 
        success: false, 
        message: "Email service not properly initialized." 
      };
    }

    console.log(`📤 Attempting to send OTP to: ${email}`);
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
    return { success: true, message: "OTP sent successfully to your email", email };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    
    if (error.code === 'EAUTH') {
      
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
       
        
        return { 
          success: true, 
          message: `OTP generated (email failed - check console for OTP code): ${otp}`, 
          email,
          developmentMode: true,
          otp: otp
        };
      }
      
      return { 
        success: false, 
        message: "Email authentication failed. Please verify your Gmail App Password is correct. Check server logs for detailed instructions." 
      };
    }
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      
      
      return { 
        success: true, 
        message: `OTP generated (email failed - check console for OTP code): ${otp}`, 
        email,
        developmentMode: true,
        otp: otp
      };
    }
    
    return { 
      success: false, 
      message: error.message || "Failed to send verification email. Please try again later." 
    };
  }
};

export const HRprTPOverifyOTP = async (email, otp) => {
  email = email.toLowerCase().trim();
  otp = String(otp).trim();

  const storedOtp = String(otpStore[email] || "").trim();
  const expiry = otpStore[`${email}_expiry`];

  if (!storedOtp) {
    return { success: false, message: "OTP not found or already used" };
  }

  if (expiry && Date.now() > expiry) {
    delete otpStore[email];
    delete otpStore[`${email}_expiry`];
    return { success: false, message: "OTP expired" };
  }

  if (storedOtp === otp) {
    delete otpStore[email];
    delete otpStore[`${email}_expiry`];
    return { success: true, message: "OTP verified successfully" };
  }

  return { success: false, message: "Invalid OTP" };
};



export const verifyOTP = async (email, otp) => {
  const storedOtp = otpStore[email];
  const expiry = otpStore[`${email}_expiry`];
  
  if (!storedOtp) {
    return { success: false, message: "OTP not found or already used" };
  }
  
  if (expiry && Date.now() > expiry) {
    delete otpStore[email];
    delete otpStore[`${email}_expiry`];
    return { success: false, message: "OTP has expired. Please request a new one." };
  }
  
  if (storedOtp == otp) {
    delete otpStore[email];
    delete otpStore[`${email}_expiry`];
    return { success: true, message: "OTP verified successfully" };
  }
  
  return { success: false, message: "Invalid OTP" };
};

// sendCompanyVerificationOTP sservices  

export const requestCompanyEmailOTP = async (email, companyName) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  
  // Store OTP and Expiry
  otpStore[email] = otp;
  otpStore[`${email}_expiry`] = Date.now() + 10 * 60 * 1000;

  const mailOptions = {
    from: `"SpreadNext Hiring" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0013E3;">SpreadNext</h2>
        </div>
        <p>Hello,</p>
        <p>To confirm you work with <strong>${companyName}</strong> and finish posting your job, please use the following verification code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0013E3; background: #f0f2ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #0013E3;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #666;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">© 2026 SpreadNext. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Verification code sent to company email" };
  } catch (error) {
    console.error("❌ Company OTP Error:", error);
    // Development fallback (aapke existing code ki tarah)
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, message: "Dev Mode: OTP is " + otp, devOtp: otp };
    }
    return { success: false, message: "Failed to send email" };
  }
};
