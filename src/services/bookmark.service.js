import Bookmark from "../models/bookmark.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// Create a bookmark
export const createBookmarkService = async (userId, itemType, itemId, notes = "") => {
  try {
    // Check if bookmark already exists
    const existing = await Bookmark.findOne({
      user: userId,
      itemType,
      itemId,
    });

    if (existing) {
      return {
        success: false,
        message: "Item already bookmarked",
      };
    }

    const bookmark = await Bookmark.create({
      user: userId,
      itemType,
      itemId,
      notes,
    });

    const populatedBookmark = await Bookmark.findById(bookmark._id)
      .populate("user", "firstName lastName userName")
      .lean();

    return {
      success: true,
      message: "Item bookmarked successfully",
      data: populatedBookmark,
    };
  } catch (error) {
    console.error("CREATE BOOKMARK ERROR:", error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "Item already bookmarked",
      };
    }
    return {
      success: false,
      message: "Failed to create bookmark",
      error: error.message,
    };
  }
};

// Get all bookmarks for a user
export const getBookmarksService = async (userId, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = { user: userId };

    // Filter by item type
    if (filters.itemType) {
      query.itemType = filters.itemType;
    }

    const bookmarks = await Bookmark.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Populate the actual items based on itemType
    const populatedBookmarks = await Promise.all(
      bookmarks.map(async (bookmark) => {
        let item = null;
        try {
          switch (bookmark.itemType) {
            case "Post":
              item = await Post.findById(bookmark.itemId)
                .populate("author", "firstName lastName userName email profileImage")
                .lean();
              break;
            case "Job":
              // Import Job model when available
              // const Job = (await import("../models/job.model.js")).default;
              // item = await Job.findById(bookmark.itemId).lean();
              break;
            case "User":
              item = await User.findById(bookmark.itemId)
                .select("firstName lastName userName email profileImage")
                .lean();
              break;
            default:
              item = null;
          }
        } catch (err) {
          console.error(`Error populating ${bookmark.itemType}:`, err);
        }

        return {
          ...bookmark,
          item,
        };
      })
    );

    const total = await Bookmark.countDocuments(query);

    return {
      success: true,
      data: populatedBookmarks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET BOOKMARKS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch bookmarks",
      error: error.message,
    };
  }
};

// Check if item is bookmarked
export const checkBookmarkService = async (userId, itemType, itemId) => {
  try {
    const bookmark = await Bookmark.findOne({
      user: userId,
      itemType,
      itemId,
    });

    return {
      success: true,
      data: { isBookmarked: !!bookmark, bookmark: bookmark || null },
    };
  } catch (error) {
    console.error("CHECK BOOKMARK ERROR:", error);
    return {
      success: false,
      message: "Failed to check bookmark",
      error: error.message,
    };
  }
};

// Delete bookmark
export const deleteBookmarkService = async (userId, itemType, itemId) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: userId,
      itemType,
      itemId,
    });

    if (!bookmark) {
      return {
        success: false,
        message: "Bookmark not found",
      };
    }

    return {
      success: true,
      message: "Bookmark removed successfully",
    };
  } catch (error) {
    console.error("DELETE BOOKMARK ERROR:", error);
    return {
      success: false,
      message: "Failed to delete bookmark",
      error: error.message,
    };
  }
};

// Delete bookmark by ID
export const deleteBookmarkByIdService = async (bookmarkId, userId) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: bookmarkId,
      user: userId,
    });

    if (!bookmark) {
      return {
        success: false,
        message: "Bookmark not found",
      };
    }

    return {
      success: true,
      message: "Bookmark removed successfully",
    };
  } catch (error) {
    console.error("DELETE BOOKMARK BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to delete bookmark",
      error: error.message,
    };
  }
};









