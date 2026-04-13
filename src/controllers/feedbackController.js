// import InterviewFeedback from "../models/interviewFeedback.model.js";
// import InterviewRound from "../models/interviewRound.model.js";
// import * as emailService from "../services/email.service.js";
// // controllers/interviewController.ts
// import JobApplication from "../models/jobApplication.model.js";


// // 🔹 Sentiment
// export const calculateSentiment = (overallRating, decision) => {
//   if (overallRating >= 4 && (decision === "strong_hire" || decision === "hire")) {
//     return "positive";
//   } else if (overallRating <= 2 || decision === "no_hire") {
//     return "negative";
//   }
//   return "neutral";
// };


// // 🔹 Update Round
// export const updateRoundWithFeedback = async (roundId, feedback) => {
//   const round = await InterviewRound.findById(roundId);
//   if (!round) return;

//   const interviewerIndex = round.interviewers.findIndex(
//     (i) => i.userId.toString() === feedback.feedbackProvider.userId.toString()
//   );

//   if (interviewerIndex !== -1) {
//     round.interviewers[interviewerIndex].feedback = feedback.feedback.strengths;
//     round.interviewers[interviewerIndex].rating = feedback.ratings.overallRating;
//     round.interviewers[interviewerIndex].submittedAt = new Date();
//   }

//   if (!round.feedback) {
//     round.feedback = {
//       technicalSkills: feedback.ratings.technicalSkills,
//       communication: feedback.ratings.communication,
//       problemSolving: feedback.ratings.problemSolving,
//       culturalFit: feedback.ratings.culturalFit,
//       overallRating: feedback.ratings.overallRating,
//       strengths: feedback.feedback.strengths,
//       weaknesses: feedback.feedback.weaknesses,
//       notes: feedback.feedback.additionalNotes,
//       recommendation: feedback.decision,
//     };
//   }

//   await round.save();
// };


// // 🔹 Round Completion
// export const checkRoundCompletion = async (roundId) => {
//   const round = await InterviewRound.findById(roundId);
//   if (!round) return;

//   const allSubmitted = round.interviewers.every((i) => i.submittedAt);

//   if (allSubmitted && round.status !== "completed") {
//     round.status = "completed";
//     round.completedAt = new Date();

//     await round.save();
//     await calculateRoundAverageRatings(roundId);
//   }
// };


// // 🔹 Avg Rating
// export const calculateRoundAverageRatings = async (roundId) => {
//   const feedbacks = await InterviewFeedback.find({ round: roundId });

//   if (!feedbacks.length) return;

//   const avg = {
//     technicalSkills: 0,
//     communication: 0,
//     problemSolving: 0,
//     culturalFit: 0,
//     overallRating: 0,
//   };

//   feedbacks.forEach((f) => {
//     avg.technicalSkills += f.ratings.technicalSkills;
//     avg.communication += f.ratings.communication;
//     avg.problemSolving += f.ratings.problemSolving;
//     avg.culturalFit += f.ratings.culturalFit;
//     avg.overallRating += f.ratings.overallRating;
//   });

//   Object.keys(avg).forEach((k) => (avg[k] /= feedbacks.length));

//   await InterviewRound.findByIdAndUpdate(roundId, {
//     "feedback.technicalSkills": avg.technicalSkills,
//     "feedback.communication": avg.communication,
//     "feedback.problemSolving": avg.problemSolving,
//     "feedback.culturalFit": avg.culturalFit,
//     "feedback.overallRating": avg.overallRating,
//   });
// };

// export const updateRoundStatus = async (req, res) => {
//   const { roundId } = req.params;
//   const { status, decision, feedbackData } = req.body; 
//   // decision: "selected" or "rejected"
//   // feedbackData: { technicalSkills: 4, communication: 3, etc. }

//   try {
//     // 1. Update the Interview Round
//     const round = await InterviewRound.findByIdAndUpdate(
//       roundId,
//       { 
//         status: "completed", 
//         decision: decision, 
//         feedback: feedbackData,
//         completedAt: Date.now() 
//       },
//       { new: true }
//     );

//     // 2. If the user failed this round, update the main JobApplication to "rejected"
//     if (decision === "rejected") {
//       await JobApplication.findByIdAndUpdate(round.application, {
//         status: "rejected"
//       });
//     }

//     // 3. Create a Feedback record (for the Radar Chart/Competency Analysis)
//     await InterviewFeedback.create({
//       application: round.application,
//       candidate: req.body.candidateId, // Profile ID
//       round: round._id,
//       roundNumber: round.roundNumber,
//       roundName: round.roundName,
//       ratings: feedbackData, // Contains technicalSkills, communication, etc.
//       decision: decision === "rejected" ? "no_hire" : "hire",
//       feedback: {
//         strengths: req.body.strengths,
//         weaknesses: req.body.weaknesses
//       }
//     });

//     res.status(200).json({ message: "Status updated successfully", round });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// // This counts how many times a user failed at specific rounds
// const stats = await InterviewRound.aggregate([
//   { $match: { candidate: userProfileId, decision: "rejected" } },
//   { $group: { 
//       _id: "$roundName", 
//       count: { $sum: 1 } 
//     } 
//   }
// ]);




// // 🔥 MAIN API
// export const submitFeedbackController = async (req, res) => {
//   try {
//     const { roundId, applicationId, candidateId, feedbackData } = req.body;

//     const providerId = req.user.id;
//     const providerInfo = {
//       name: req.user.name,
//       email: req.user.email,
//       role: req.user.role,
//       department: req.user.department,
//     };

//     const round = await InterviewRound.findById(roundId);
//     if (!round) throw new Error("Interview round not found");

//     const exists = await InterviewFeedback.findOne({
//       round: roundId,
//       "feedbackProvider.userId": providerId,
//     });

//     if (exists) {
//       return res.status(400).json({ message: "Feedback already submitted" });
//     }

//     const sentiment = calculateSentiment(
//       feedbackData.ratings.overallRating,
//       feedbackData.decision
//     );

//     const feedback = await InterviewFeedback.create({
//       application: applicationId,
//       candidate: candidateId,
//       round: roundId,
//       roundNumber: round.roundNumber,
//       roundName: round.customRoundName || round.roundName,
//       feedbackProvider: {
//         userId: providerId,
//         name: providerInfo.name,
//         email: providerInfo.email,
//       },
//       ratings: feedbackData.ratings,
//       feedback: feedbackData.feedback,
//       decision: feedbackData.decision,
//       sentiment,
//     });

//     await updateRoundWithFeedback(roundId, feedback);
//     await checkRoundCompletion(roundId);

//     // ✅ EMAIL TRIGGER
//     await emailService.sendFeedbackConfirmationEmail(providerInfo, feedback);

//     return res.json({
//       success: true,
//       message: "Feedback submitted successfully",
//       data: feedback,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };





// export const submitManualFeedback = async (req, res) => {
//   const { applicationId, candidateId, rounds } = req.body;

//   try {
//     for (const roundData of rounds) {
//       // 1. Create or Update the Interview Round
//       const round = await InterviewRound.findOneAndUpdate(
//         { application: applicationId, roundNumber: roundData.number },
//         {
//           roundName: roundData.type,
//           status: "completed",
//           decision: roundData.decision, // "selected" or "rejected"
//           feedback: roundData.ratings,
//           completedAt: new Date(),
//         },
//         { upsert: true, new: true }
//       );

//       // 2. Create detailed feedback for the Radar Competency Chart
//       await InterviewFeedback.create({
//         application: applicationId,
//         candidate: candidateId,
//         round: round._id,
//         roundNumber: roundData.number,
//         roundName: roundData.type,
//         ratings: roundData.ratings,
//         decision: roundData.decision === "rejected" ? "no_hire" : "hire",
//         feedback: {
//           strengths: roundData.notes || "Manual Entry",
//           weaknesses: roundData.decision === "rejected" ? "Technical gap" : "None",
//         },
//       });
//     }

//     // 3. Update the overall Job Application status
//     // If any round is "rejected", the whole application is "rejected"
//     const isRejected = rounds.some((r) => r.decision === "rejected");
//     if (isRejected) {
//       await JobApplication.findByIdAndUpdate(applicationId, { status: "rejected" });
//     }

//     res.status(200).json({ success: true, message: "User profile updated!" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// // routes/analytics.js
// router.get("/user-edge-stats", async (req, res) => {
//   try {
//     const userId = req.user.id; // Get from auth middleware

//     // 1. Get all interview rounds for this user across all job applications
//     const rounds = await InterviewRound.find({ candidate: userId });

//     // 2. Get all feedback ratings for the Radar Chart
//     const feedbacks = await InterviewFeedback.find({ candidate: userId });

//     res.json({ rounds, feedbacks });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


import { saveManualFeedback, getUserEdgeStats } from '../services/feedback.service.js';

export const submitManualFeedback = async (req, res) => {
  try {
    const { applicationId, candidateId, rounds } = req.body;

    // Validation
    if (!applicationId || !candidateId || !rounds || rounds.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    await saveManualFeedback(applicationId, candidateId, rounds);

    res.status(200).json({ success: true, message: "Candidate profile updated successfully!" });
  } catch (error) {
    console.error("Manual Feedback Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const fetchUserEdgeStats = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes auth middleware sets req.user

    const data = await getUserEdgeStats(userId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Fetch Stats Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};