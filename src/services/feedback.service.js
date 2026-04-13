// controllers/roundController.js

// import {emailService} from "./email.service.js";
import InterviewFeedback from "../models/interviewFeedback.model.js";
import InterviewRound from "../models/interviewRound.model.js";
import JobApplication from "../models/jobApplication.model.js";



// // 🔹 Calculate Sentiment
// export const calculateSentiment = (overallRating, decision) => {
//   if (overallRating >= 4 && (decision === "strong_hire" || decision === "hire")) {
//     return "positive";
//   } else if (overallRating <= 2 || decision === "no_hire") {
//     return "negative";
//   }
//   return "neutral";
// };


// // 🔹 Update Round with Feedback
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


// // 🔹 Check Round Completion
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


// // 🔹 Calculate Average Ratings
// export const calculateRoundAverageRatings = async (roundId) => {
//   const feedbacks = await InterviewFeedback.find({ round: roundId });
//   if (feedbacks.length === 0) return;

//   const avgRatings = {
//     technicalSkills: 0,
//     communication: 0,
//     problemSolving: 0,
//     culturalFit: 0,
//     overallRating: 0,
//   };

//   feedbacks.forEach((f) => {
//     avgRatings.technicalSkills += f.ratings.technicalSkills;
//     avgRatings.communication += f.ratings.communication;
//     avgRatings.problemSolving += f.ratings.problemSolving;
//     avgRatings.culturalFit += f.ratings.culturalFit;
//     avgRatings.overallRating += f.ratings.overallRating;
//   });

//   const count = feedbacks.length;

//   Object.keys(avgRatings).forEach((key) => {
//     avgRatings[key] = avgRatings[key] / count;
//   });

//   await InterviewRound.findByIdAndUpdate(roundId, {
//     "feedback.technicalSkills": avgRatings.technicalSkills,
//     "feedback.communication": avgRatings.communication,
//     "feedback.problemSolving": avgRatings.problemSolving,
//     "feedback.culturalFit": avgRatings.culturalFit,
//     "feedback.overallRating": avgRatings.overallRating,
//   });
// };


// // 🔥 MAIN FUNCTION: Submit Feedback
// export const submitFeedback = async ({
//   roundId,
//   applicationId,
//   candidateId,
//   feedbackData,
//   providerId,
//   providerInfo,
// }) => {
//   try {
//     const round = await InterviewRound.findById(roundId);
//     if (!round) throw new Error("Interview round not found");

//     const existingFeedback = await InterviewFeedback.findOne({
//       round: roundId,
//       "feedbackProvider.userId": providerId,
//     });

//     if (existingFeedback) {
//       throw new Error("Feedback already submitted for this round");
//     }

//     const sentiment = calculateSentiment(
//       feedbackData.ratings.overallRating,
//       feedbackData.decision
//     );

//     const feedback = new InterviewFeedback({
//       application: applicationId,
//       candidate: candidateId,
//       round: roundId,
//       roundNumber: round.roundNumber,
//       roundName: round.customRoundName || round.roundName,
//       feedbackProvider: {
//         userId: providerId,
//         name: providerInfo.name,
//         email: providerInfo.email,
//         role: providerInfo.role || "interviewer",
//         department: providerInfo.department,
//       },
//       ratings: feedbackData.ratings,
//       feedback: feedbackData.feedback,
//       decision: feedbackData.decision,
//       sentiment,
//       tags: feedbackData.tags || [],
//     });

//     await feedback.save();

//     await updateRoundWithFeedback(roundId, feedback);
//     await checkRoundCompletion(roundId);

//     await emailService.sendFeedbackConfirmationEmail(providerInfo, feedback);

//     return {
//       success: true,
//       data: feedback,
//     };
//   } catch (error) {
//     console.error("Submit feedback error:", error);
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// };





// 1. Service to save manual feedback
export const saveManualFeedback = async (applicationId, candidateId, rounds) => {
  for (const roundData of rounds) {
    // Upsert Interview Round
    const round = await InterviewRound.findOneAndUpdate(
      { application: applicationId, roundNumber: roundData.number },
      {
        roundName: roundData.type,
        status: "completed",
        decision: roundData.decision, 
        feedback: roundData.ratings,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Upsert Detailed Feedback
    await InterviewFeedback.findOneAndUpdate(
      { application: applicationId, roundNumber: roundData.number },
      {
        candidate: candidateId,
        round: round._id,
        roundName: roundData.type,
        ratings: roundData.ratings,
        decision: roundData.decision === "rejected" ? "no_hire" : "hire",
        feedback: {
          strengths: roundData.notes || "Manual Entry",
          weaknesses: roundData.decision === "rejected" ? "Technical gap" : "None",
        },
      },
      { upsert: true, new: true }
    );
  }

  // Check if any round failed to update the main application status
  const isRejected = rounds.some((r) => r.decision === "rejected");
  if (isRejected) {
    await JobApplication.findByIdAndUpdate(applicationId, { status: "rejected" });
  }

  return { success: true };
};

// 2. Service to fetch stats for the Edge Profile
export const getUserEdgeStats = async (candidateId) => {
  const rounds = await InterviewRound.find({ candidate: candidateId });
  const feedbacks = await InterviewFeedback.find({ candidate: candidateId });
  
  return { rounds, feedbacks };
};