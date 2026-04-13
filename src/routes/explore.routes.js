import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getTrendingContent,
  getTrendingJobs,
  getTrendingTopics,
  getPersonalizedSuggestions,
} from "../controllers/explore.controller.js";

const router = express.Router();

// Public routes
router.get("/", getTrendingContent);
router.get("/trending-jobs", getTrendingJobs);
router.get("/trending-topics", getTrendingTopics);

// Protected routes
router.get("/suggestions", authMiddleware, getPersonalizedSuggestions);

export default router;









