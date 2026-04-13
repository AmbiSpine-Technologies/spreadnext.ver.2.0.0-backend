import {
  getProfileAnalyticsService,
  getCommunityAnalyticsService,
  getJobAnalyticsService,
} from "../services/analytics.service.js";
import { MSG } from "../constants/messages.js";

// Get profile analytics
export const getProfileAnalytics = async (req, res) => {
  try {
    const result = await getProfileAnalyticsService(req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET PROFILE ANALYTICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community analytics
export const getCommunityAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getCommunityAnalyticsService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITY ANALYTICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get job analytics
export const getJobAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getJobAnalyticsService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET JOB ANALYTICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









