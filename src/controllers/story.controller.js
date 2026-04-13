import {
  createStoryValidation,
} from "../validations/post.validation.js";
import {
  createStoryService,
  getStoriesService,
  getStoryByIdService,
  viewStoryService,
  deleteStoryService,
  getStoryViewersService,
} from "../services/story.service.js";
import { MSG } from "../constants/messages.js";

// Create a story
export const createStory = async (req, res) => {
  try {
    const { error } = createStoryValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createStoryService(req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE STORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get stories feed
export const getStories = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const result = await getStoriesService(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET STORIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get single story by ID
export const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;

    const result = await getStoryByIdService(id, userId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("GET STORY BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// View a story (add viewer)
export const viewStory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await viewStoryService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("VIEW STORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete story
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteStoryService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE STORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get story viewers
export const getStoryViewers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await getStoryViewersService(id, req.user._id, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET STORY VIEWERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









