import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createResume,
  getResumes,
  getResumeById,
  getResumeByShareToken,
  updateResume,
  deleteResume,
  generatePdf,
  getTemplates,
  generateShareToken,
} from "../controllers/resume.controller.js";

const router = express.Router();

// Public routes
router.get("/templates", getTemplates);
router.get("/share/:token", getResumeByShareToken);

// Protected routes
router.use(authMiddleware);

router.get("/", getResumes);
router.post("/", createResume);
router.get("/:id", getResumeById);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/generate-pdf", generatePdf);
router.post("/:id/share", generateShareToken);

export default router;









