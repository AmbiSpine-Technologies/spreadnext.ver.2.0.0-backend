import Assessment from "../models/assessment.model.js";
import {
  canTakeAssessmentService,
  getQuestionsService,
  sanitizeQuestionsService,
  calculateScoreService,
  getAssessmentStatusService,
  getAllAssessmentsService,
  getAssessmentByIdService,
  getAssessmentByUserService,

} from "../services/assessment.service.js";

// export const startAssessment = async (req, res) => {
//   try {
//     const { jobId, jobTitle } = req.body;
//     const userId = req.user._id;
//     const userType = req.user.isPremium ? "premium" : "non-premium";

//     const { canTake } = await canTakeAssessmentService(userId, jobId);
//     if (!canTake) return res.status(400).json({ success: false, message: "Already attempted" });

//     // 1. Generate questions
//     const selectedQuestions = getQuestionsService(jobTitle, userType);

//     // 2. Create assessment AND save questions in DB
//     const assessment = await Assessment.create({
//       user: userId,
//       job: jobId,
//       questions: selectedQuestions, // Ab ye undefined nahi hoga
//       totalQuestions: selectedQuestions.length,
//       status: "in-progress"
//     });

//     res.json({
//       success: true,
//       data: {
//         assessmentId: assessment._id,
//         questions: sanitizeQuestionsService(selectedQuestions),
//         timeLimit: 300,
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const startAssessment = async (req, res) => {
  try {
    const { jobId, jobTitle } = req.body;
    const userId = req.user._id;
    const userType = req.user.isPremium ? "premium" : "non-premium";

    // 1. Check karein ki user ne ye test pehle hi complete toh nahi kar liya
    const { canTake } = await canTakeAssessmentService(userId, jobId);
    if (!canTake) {
      return res.status(400).json({ success: false, message: "Already attempted" });
    }

    // 2. Questions select karein (Ye tabhi use honge jab naya record insert hoga)
    const selectedQuestions = getQuestionsService(jobTitle, userType);

    // 3. FIX: findOneAndUpdate use karein takay duplicates na banein
    const assessment = await Assessment.findOneAndUpdate(
      { 
        user: userId, 
        job: jobId, 
        status: "in-progress" 
      }, // Dhundo agar koi "in-progress" test pehle se hai
      { 
        $setOnInsert: { 
          user: userId,
          job: jobId,
          questions: selectedQuestions, 
          totalQuestions: selectedQuestions.length,
          status: "in-progress"
        } 
      }, // Agar record nahi mila, toh hi ye data insert karo
      { 
        upsert: true, // Agar nahi mila toh naya banao
        new: true,    // Humesha updated/naya document return karo
        setDefaultsOnInsert: true 
      }
    );

    res.json({
      success: true,
      data: {
        assessmentId: assessment._id,
        // Humesha database wale questions return karein (sanitized)
        questions: sanitizeQuestionsService(assessment.questions),
        timeLimit: 600,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;
    const userId = req.user._id;

    // Assessment ko find karein
    const assessment = await Assessment.findOne({ _id: assessmentId, user: userId, status: "in-progress" });
    if (!assessment) return res.status(404).json({ success: false, message: "Invalid assessment" });

    // 3. Logic: Assessment ke andar saved questions se score check karein
    const results = calculateScoreService(answers, assessment.questions);

    assessment.answers = results.detailed;
    assessment.score = results.score;
    assessment.passed = results.passed;
    assessment.status = "completed";
    assessment.completedAt = new Date();
    await assessment.save();

    res.json({
      success: true,
      data: {
        score: results.score,
        passed: results.passed,
        correct: results.correct,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssessmentStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const result = await getAssessmentStatusService(userId, jobId);

    return res.json({
      success: true,
      data: result, // null ya object dono handle ho jayega
    });

  } catch (error) {
    console.error("Error in getAssessmentStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getAllAssessments = async (req, res) => {
  try {

    const assessments = await getAllAssessmentsService();

    res.status(200).json({
      success: true,
      data: assessments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET assessment by ID
 */
export const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await getAssessmentByIdService(id);

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET assessments by user
 */
export const getAssessmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const assessments = await getAssessmentByUserService(userId);

    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};