import Story from "../models/story.model.js";
import User from "../models/user.model.js";

// Create a story
export const createStoryService = async (data, userId) => {
  try {
    const story = await Story.create({
      ...data,
      author: userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    const populatedStory = await Story.findById(story._id)
      .populate("author", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Story created successfully",
      data: populatedStory,
    };
  } catch (error) {
    console.error("CREATE STORY ERROR:", error);
    return {
      success: false,
      message: "Failed to create story",
      error: error.message,
    };
  }
};

// Get stories feed (active stories from users)
export const getStoriesService = async (userId = null) => {
  try {
    const now = new Date();
    const stories = await Story.find({
      expiresAt: { $gt: now },
      isDeleted: false,
    })
      .populate("author", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .lean();

    // Group stories by author
    const storiesByAuthor = {};
    stories.forEach((story) => {
      const authorId = story.author._id.toString();
      if (!storiesByAuthor[authorId]) {
        storiesByAuthor[authorId] = {
          author: story.author,
          stories: [],
        };
      }
      storiesByAuthor[authorId].stories.push(story);
    });

    // Convert to array
    const storiesArray = Object.values(storiesByAuthor);

    return {
      success: true,
      data: storiesArray,
    };
  } catch (error) {
    console.error("GET STORIES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch stories",
      error: error.message,
    };
  }
};

// Get single story by ID
export const getStoryByIdService = async (storyId, userId = null) => {
  try {
    const story = await Story.findOne({
      _id: storyId,
      expiresAt: { $gt: new Date() },
      isDeleted: false,
    })
      .populate("author", "firstName lastName userName email profileImage")
      .populate("viewers.user", "firstName lastName userName")
      .lean();

    if (!story) {
      return {
        success: false,
        message: "Story not found or expired",
      };
    }

    return {
      success: true,
      data: story,
    };
  } catch (error) {
    console.error("GET STORY BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch story",
      error: error.message,
    };
  }
};

// View a story (add viewer)
export const viewStoryService = async (storyId, userId) => {
  try {
    const story = await Story.findOne({
      _id: storyId,
      expiresAt: { $gt: new Date() },
      isDeleted: false,
    });

    if (!story) {
      return {
        success: false,
        message: "Story not found or expired",
      };
    }

    await story.addViewer(userId);

    return {
      success: true,
      message: "Story viewed",
      data: { viewsCount: story.viewsCount },
    };
  } catch (error) {
    console.error("VIEW STORY ERROR:", error);
    return {
      success: false,
      message: "Failed to view story",
      error: error.message,
    };
  }
};

// Delete story
export const deleteStoryService = async (storyId, userId) => {
  try {
    const story = await Story.findOne({
      _id: storyId,
      author: userId,
      isDeleted: false,
    });

    if (!story) {
      return {
        success: false,
        message: "Story not found or unauthorized",
      };
    }

    story.isDeleted = true;
    await story.save();

    return {
      success: true,
      message: "Story deleted successfully",
    };
  } catch (error) {
    console.error("DELETE STORY ERROR:", error);
    return {
      success: false,
      message: "Failed to delete story",
      error: error.message,
    };
  }
};

// Get story viewers
export const getStoryViewersService = async (storyId, userId, page = 1, limit = 20) => {
  try {
    const story = await Story.findOne({
      _id: storyId,
      author: userId,
      isDeleted: false,
    }).populate("viewers.user", "firstName lastName userName email profileImage");

    if (!story) {
      return {
        success: false,
        message: "Story not found or unauthorized",
      };
    }

    const skip = (page - 1) * limit;
    const viewers = story.viewers
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
      .slice(skip, skip + limit);

    return {
      success: true,
      data: viewers,
      pagination: {
        page,
        limit,
        total: story.viewers.length,
        pages: Math.ceil(story.viewers.length / limit),
      },
    };
  } catch (error) {
    console.error("GET STORY VIEWERS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch viewers",
      error: error.message,
    };
  }
};









