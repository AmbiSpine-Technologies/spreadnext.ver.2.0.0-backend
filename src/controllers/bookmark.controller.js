import {
  createBookmarkService,
  getBookmarksService,
  checkBookmarkService,
  deleteBookmarkService,
  deleteBookmarkByIdService,
} from "../services/bookmark.service.js";
import { MSG } from "../constants/messages.js";

// Create a bookmark
export const createBookmark = async (req, res) => {
  try {
    const { itemType, itemId, notes } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: "itemType and itemId are required",
      });
    }

    const result = await createBookmarkService(req.user._id, itemType, itemId, notes);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE BOOKMARK ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get all bookmarks
export const getBookmarks = async (req, res) => {
  try {
    const { itemType, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (itemType) filters.itemType = itemType;

    const result = await getBookmarksService(req.user._id, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET BOOKMARKS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Check if item is bookmarked
export const checkBookmark = async (req, res) => {
  try {
    const { itemType, itemId } = req.query;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: "itemType and itemId are required",
      });
    }

    const result = await checkBookmarkService(req.user._id, itemType, itemId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("CHECK BOOKMARK ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete bookmark
export const deleteBookmark = async (req, res) => {
  try {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: "itemType and itemId are required",
      });
    }

    const result = await deleteBookmarkService(req.user._id, itemType, itemId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE BOOKMARK ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete bookmark by ID
export const deleteBookmarkById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteBookmarkByIdService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE BOOKMARK BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









