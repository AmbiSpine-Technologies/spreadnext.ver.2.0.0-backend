import {
  getActivitiesService,
  getActivitiesByTypeService,
} from "../services/activity.service.js";
import { MSG } from "../constants/messages.js";

// Get user activities
export const getActivities = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (type) filters.type = type;

    const result = await getActivitiesService(req.user._id, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET ACTIVITIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get activities by type
export const getActivitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await getActivitiesByTypeService(req.user._id, type, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET ACTIVITIES BY TYPE ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









