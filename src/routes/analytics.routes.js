import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getProfileAnalytics,
  getCommunityAnalytics,
  getJobAnalytics,
} from "../controllers/analytics.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/profile", getProfileAnalytics);
router.get("/community/:id", getCommunityAnalytics);
router.get("/job/:id", getJobAnalytics);

export default router;









