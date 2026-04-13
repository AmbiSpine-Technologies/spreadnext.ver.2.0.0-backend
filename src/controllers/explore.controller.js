import {
  getTrendingContentService,
  getTrendingJobsService,
  getTrendingTopicsService,
  getPersonalizedSuggestionsService,
} from "../services/explore.service.js";
import { MSG } from "../constants/messages.js";

// Get trending content
export const getTrendingContent = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await getTrendingContentService(parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET TRENDING CONTENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get trending jobs
export const getTrendingJobs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await getTrendingJobsService(parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET TRENDING JOBS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get trending topics
export const getTrendingTopics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await getTrendingTopicsService(parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET TRENDING TOPICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get personalized suggestions
export const getPersonalizedSuggestions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    const result = await getPersonalizedSuggestionsService(userId, parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET PERSONALIZED SUGGESTIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









