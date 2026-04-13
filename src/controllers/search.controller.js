import {
  globalSearchService,
  searchUsersService,
  searchPostsService,
  searchJobsService,
  searchCommunitiesService,
} from "../services/search.service.js";
import { MSG } from "../constants/messages.js";

// Global search
export const globalSearch = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const filters = {};
    if (type) filters.type = type;

    const result = await globalSearchService(q, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GLOBAL SEARCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await searchUsersService(q, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("SEARCH USERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Search posts
export const searchPosts = async (req, res) => {
  try {
    const { q, author, tags, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const filters = {};
    if (author) filters.author = author;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

    const result = await searchPostsService(q, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("SEARCH POSTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Search jobs
export const searchJobs = async (req, res) => {
  try {
    const { q, location, workMode, jobType, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const filters = {};
    if (location) filters.location = location;
    if (workMode) filters.workMode = workMode;
    if (jobType) filters.jobType = jobType;

    const result = await searchJobsService(q, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("SEARCH JOBS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Search communities
export const searchCommunities = async (req, res) => {
  try {
    const { q, privacy, category, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const filters = {};
    if (privacy) filters.privacy = privacy;
    if (category) filters.category = category;

    const result = await searchCommunitiesService(q, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("SEARCH COMMUNITIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









