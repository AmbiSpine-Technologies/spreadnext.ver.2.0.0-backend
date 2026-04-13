import {
  followUserService,
  unfollowUserService,
  getFollowersService,
  getFollowingService,
  checkConnectionService,
  getFriendSuggestionsService,
  searchUsersService,
} from "../services/connection.service.js";
import { MSG } from "../constants/messages.js";

// Follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await followUserService(userId, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("FOLLOW USER ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await unfollowUserService(userId, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UNFOLLOW USER ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const result = await getFollowersService(userId, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET FOLLOWERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const result = await getFollowingService(userId, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET FOLLOWING ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Check connection status
export const checkConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await checkConnectionService(userId, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("CHECK CONNECTION ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get friend suggestions
export const getFriendSuggestions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await getFriendSuggestionsService(req.user._id, parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET FRIEND SUGGESTIONS ERROR:", err);
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









