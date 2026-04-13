import Repost from "../models/repost.model.js";
import Post from "../models/post.model.js";
import { createRepostNotification } from "./notification.service.js";

// Create a repost
export const createRepostService = async (postId, caption, userId) => {
  try {
    const originalPost = await Post.findById(postId);
    if (!originalPost || originalPost.isDeleted) {
      return {
        success: false,
        message: "Post not found",
      };
    }

    // Check if user already reposted this post
    const existingRepost = await Repost.findOne({
      user: userId,
      originalPost: postId,
    });

    if (existingRepost) {
      return {
        success: false,
        message: "You have already reposted this post",
      };
    }

    const repost = await Repost.create({
      originalPost: postId,
      user: userId,
      caption: caption || "",
    });

    // Increment repost count on original post
    await originalPost.incrementReposts();

    // Create notification
    await createRepostNotification(postId, originalPost.author.toString(), userId.toString());

    const populatedRepost = await Repost.findById(repost._id)
      .populate("user", "firstName lastName userName email profileImage")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "firstName lastName userName email profileImage",
        },
      })
      .lean();

    return {
      success: true,
      message: "Post reposted successfully",
      data: populatedRepost,
    };
  } catch (error) {
    console.error("CREATE REPOST ERROR:", error);
    if (error.code === 11000) {
      // Duplicate key error
      return {
        success: false,
        message: "You have already reposted this post",
      };
    }
    return {
      success: false,
      message: "Failed to repost",
      error: error.message,
    };
  }
};

// Remove repost
export const removeRepostService = async (postId, userId) => {
  try {
    const repost = await Repost.findOne({
      user: userId,
      originalPost: postId,
    });

    if (!repost) {
      return {
        success: false,
        message: "Repost not found",
      };
    }

    await Repost.findByIdAndDelete(repost._id);

    // Decrement repost count on original post
    const originalPost = await Post.findById(postId);
    if (originalPost) {
      await originalPost.decrementReposts();
    }

    return {
      success: true,
      message: "Repost removed successfully",
    };
  } catch (error) {
    console.error("REMOVE REPOST ERROR:", error);
    return {
      success: false,
      message: "Failed to remove repost",
      error: error.message,
    };
  }
};

