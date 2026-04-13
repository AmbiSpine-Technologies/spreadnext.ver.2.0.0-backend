import nodemailer from "nodemailer";
import { google } from "googleapis";

let transporter = null;

// 🔹 Initialize Transporter
export const initializeTransporter = async () => {
  try {
    if (transporter) return transporter;

    if (process.env.GMAIL_CLIENT_ID) {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
      );

      oAuth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      const accessToken = await oAuth2Client.getAccessToken();

      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    console.log("Email transporter initialized");
    return transporter;
  } catch (error) {
    console.error("Transporter init failed:", error);
    throw error;
  }
};


// 🔹 Send Email
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transport = await initializeTransporter();

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "Recruitment Team"}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transport.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendStatusUpdateEmail = async (candidate, status, roundInfo = null) => {
  const templates = {
    shortlisted: {
      subject: "Congratulations! Your Application Has Been Shortlisted",
      html: getShortlistedEmailTemplate(candidate, roundInfo),
    },
    interview_scheduled: {
      subject: "Interview Scheduled - Next Steps",
      html: getInterviewScheduledEmailTemplate(candidate, roundInfo),
    },
    selected: {
      subject: "🎉 Congratulations! You've Been Selected",
      html: getSelectedEmailTemplate(candidate),
    },
    rejected: {
      subject: "Update on Your Application Status",
      html: getRejectedEmailTemplate(candidate),
    },
  };

  const template = templates[status];
  if (!template) {
    return { success: false, error: "Invalid status" };
  }

  return await sendEmail({
    to: candidate.email,
    subject: template.subject,
    html: template.html,
  });
};


export const sendFeedbackRequestEmail = async (interviewer, candidate, roundInfo) => {
  const feedbackLink = `${process.env.FRONTEND_URL}/feedback/${roundInfo.roundId}`;

  const html = `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Interview Feedback Required</h2>
      <p>Hello ${interviewer.name},</p>
      <p>Please submit feedback for <strong>${candidate.name}</strong></p>

      <p><b>Round:</b> ${roundInfo.roundName}</p>
      <p><b>Date:</b> ${roundInfo.date}</p>

      <a href="${feedbackLink}" style="padding:10px 20px;background:#667eea;color:#fff;border-radius:5px;text-decoration:none;">
        Submit Feedback
      </a>
    </div>
  `;

  return await sendEmail({
    to: interviewer.email,
    subject: `Feedback Required: ${candidate.name}`,
    html,
  });
};


export const getShortlistedEmailTemplate = (candidate) => `
  <h2>Great News, ${candidate.name}!</h2>
  <p>You are shortlisted 🎉</p>
`;

export const getInterviewScheduledEmailTemplate = (candidate, roundInfo) => `
  <h2>Interview Scheduled</h2>
  <p>${candidate.name}, your interview is scheduled.</p>
  <p><b>Date:</b> ${roundInfo.date}</p>
`;

export const getSelectedEmailTemplate = (candidate) => `
  <h1>🎉 Congratulations ${candidate.name}</h1>
  <p>You are selected!</p>
`;

export const getRejectedEmailTemplate = (candidate) => `
  <p>Dear ${candidate.name},</p>
  <p>We regret to inform you...</p>
`;


// services/emailService.js

export const sendFeedbackConfirmationEmail = async (providerInfo, feedback) => {
  const html = `
    <div style="font-family: Arial;">
      <h2>Feedback Submitted ✅</h2>
      <p>Hi ${providerInfo.name},</p>
      <p>Your feedback for <b>${feedback.roundName}</b> has been successfully submitted.</p>

      <p><b>Rating:</b> ${feedback.ratings.overallRating}/5</p>
      <p><b>Decision:</b> ${feedback.decision}</p>

      <p>Thanks for your contribution 🙌</p>
    </div>
  `;

  return await sendEmail({
    to: providerInfo.email,
    subject: "Feedback Submitted Successfully",
    html,
  });
};