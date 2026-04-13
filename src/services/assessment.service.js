import Assessment from "../models/assessment.model.js";
import Application from "../models/jobApplication.model.js";
import { assessmentQuestions } from "../constants/data.js";

export const canTakeAssessmentService = async (userId, jobId) => {
  const existing = await Assessment.findOne({
    user: userId,
    job: jobId,
    status: "completed",
  });

  return { canTake: !existing, existing };
};

export const createAssessmentService = async (userId, jobId) => {
  const ids = questions.map(q => q.id);

 return await Assessment.create({
    user: userId,
    job: jobId,
    questions: selectedQuestions, // ⚡ Important: Database mein fix ho gaye questions
    status: "in-progress"
  });
};

export const getQuestionsService = (jobTitle, userType) => {
  const pool =
    assessmentQuestions[userType]?.[jobTitle] ||
    assessmentQuestions[userType]?.default ||
    [];

  return [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
};

export const sanitizeQuestionsService = (questions) => {
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));
};

export const calculateScoreService = (userAnswers, savedQuestions) => {
  let correct = 0;

  const detailed = userAnswers.map((ans) => {
    // String aur Number ka mismatch handle karne ke liye == use karein
    const question = savedQuestions.find(q => q.id == ans.questionId);
    const isCorrect = question && question.correctAnswer === ans.selectedAnswer;
    
    if (isCorrect) correct++;

    return {
      questionId: ans.questionId,
      selectedAnswer: ans.selectedAnswer,
      isCorrect: !!isCorrect
    };
  });

  const score = (correct / savedQuestions.length) * 100;
  return {
    score,
    passed: score >= 80,
    correct,
    total: savedQuestions.length,
    detailed
  };
};

export const completeAssessmentService = async (
  assessment,
  results
) => {
  assessment.answers = results.detailed;
  assessment.score = results.score;
  assessment.passed = results.passed;
  assessment.correctAnswers = results.correct;
  assessment.completedAt = new Date();
  assessment.status = "completed";

  await assessment.save();
  return assessment;
};

export const createApplicationIfPassedService = async (
  userId,
  jobId,
  assessmentId,
  passed
) => {
  if (!passed) return null;

  return await Application.create({
    user: userId,
    job: jobId,
    assessment: assessmentId,
    status: "pending",
  });
};


export const getAssessmentStatusService = async (userId, jobId) => {
  const assessment = await Assessment.findOne({
    user: userId,
    job: jobId,
    status: "completed",
  });

  if (!assessment) {
    return null;
  }

  return {
    score: assessment.score,
    passed: assessment.passed,
  };
};




/**
 * Get all assessments
 */
export const getAllAssessmentsService = async () => {
  const assessments = await Assessment.find()
    .populate("user", "firstName lastName email mobileNo ")
    .populate("job", "title company");

  return assessments;
};

/**
 * Get assessment by ID
 */
export const getAssessmentByIdService = async (assessmentId) => {
  const assessment = await Assessment.findById(assessmentId)
    .populate("user", "firstName lastName email")
    .populate("job", "title company");

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  return assessment;
};

/**
 * Get assessments by user
 */
export const getAssessmentByUserService = async (userId) => {
  const assessments = await Assessment.find({ user: userId })
    .populate("job", "title company");

  return assessments;
};