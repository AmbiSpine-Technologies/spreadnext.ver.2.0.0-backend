import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createCollaboration,
  getCollaborations,
  getCollaborationById,
  updateCollaboration,
  joinCollaboration,
  leaveCollaboration,
} from "../controllers/collaboration.controller.js";

const router = express.Router();

// Public routes
router.get("/", getCollaborations); // Can be public with filters
router.get("/:id", getCollaborationById); // Can be public

// Protected routes
router.use(authMiddleware);

router.post("/", createCollaboration);
router.put("/:id", updateCollaboration);
router.post("/:id/join", joinCollaboration);
router.delete("/:id/leave", leaveCollaboration);

export default router;









