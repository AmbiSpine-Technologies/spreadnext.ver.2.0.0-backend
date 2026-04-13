// routes/feedbackRoutes.js
import express from "express";
import { submitManualFeedback, fetchUserEdgeStats} from '../controllers/feedbackController.js'
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.post("/submit", authMiddleware, submitFeedbackController);
router.post("/manual-feedback", submitManualFeedback);
router.get("/user-edge-stats",  authMiddleware,  fetchUserEdgeStats);
export default router;