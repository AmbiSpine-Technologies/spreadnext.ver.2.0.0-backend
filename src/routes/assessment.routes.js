import express from "express";
import { startAssessment, submitAssessment, getAssessmentStatus, getAllAssessments, getAssessmentById, getAssessmentsByUser  } from "../controllers/assessment.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/start", authMiddleware, startAssessment);
router.post("/submit", authMiddleware, submitAssessment);
router.get("/:jobId/status", authMiddleware, getAssessmentStatus);
router.get("/", authMiddleware, getAllAssessments);
router.get("/:id", authMiddleware, getAssessmentById);
router.get("/user/:userId", authMiddleware, getAssessmentsByUser);

export default router;
