import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Like from "../models/like.model.js";
import { createCommentNotification } from "./notification.service.js";

// Create a comment
export const createCommentService = async (postId, data, userId) => {
  try {
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return {
        success: false,
        message: "Post not found",
      };
    }
console.log("COMMENT DATA:", data);
console.log("CONTENT:", data?.content);
    const comment = await Comment.create({
      content: data.content,
      post: postId,
      author: userId,
      parentComment: data.parentComment || null,
    });

    // Increment comment count on post
    await post.incrementComments();

    // If this is a reply, increment parent comment's replies count
    if (data.parentComment) {
      const parent = await Comment.findById(data.parentComment);
      if (parent) {
        await parent.incrementReplies();
      }
    }

    // Create notification (only for top-level comments, not replies)
    if (!data.parentComment) {
      await createCommentNotification(postId, comment._id, post.author.toString(), userId.toString());
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "firstName lastName userName email profileImage")
      .populate("parentComment")
      .lean();

    return {
      success: true,
      message: "Comment created successfully",
      data: populatedComment,
    };
  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);
    return {
      success: false,
      message: "Failed to create comment",
      error: error.message,
    };
  }
};

// Get comments for a post
export const getCommentsService = async (postId, page = 1, limit = 10, userId = null) => {
  try {
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      post: postId,
      parentComment: null, // Get only top-level comments
      isDeleted: false,
    })
      .populate("author", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get replies for each comment (limit to 3 replies per comment)
    for (let comment of comments) {
      const replies = await Comment.find({
        parentComment: comment._id,
        isDeleted: false,
      })
        .populate("author", "firstName lastName userName email profileImage")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      comment.replies = replies;

      // Check if user liked this comment
      if (userId) {
        const like = await Like.findOne({
          user: userId,
          targetType: "Comment",
          targetId: comment._id,
        });
        comment.isLiked = !!like;
      } else {
        comment.isLiked = false;
      }
    }

    const total = await Comment.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false,
    });

    return {
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    };
  }
};

// Get replies to a comment
export const getCommentRepliesService = async (commentId, page = 1, limit = 10, userId = null) => {
  try {
    const skip = (page - 1) * limit;

    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false,
    })
      .populate("author", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Check if user liked each reply
    if (userId) {
      for (let reply of replies) {
        const like = await Like.findOne({
          user: userId,
          targetType: "Comment",
          targetId: reply._id,
        });
        reply.isLiked = !!like;
      }
    }

    const total = await Comment.countDocuments({
      parentComment: commentId,
      isDeleted: false,
    });

    return {
      success: true,
      data: replies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COMMENT REPLIES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch replies",
      error: error.message,
    };
  }
};

// Update comment
export const updateCommentService = async (commentId, data, userId) => {
  try {
    const comment = await Comment.findOne({
      _id: commentId,
      author: userId,
      isDeleted: false,
    });

    if (!comment) {
      return {
        success: false,
        message: "Comment not found or unauthorized",
      };
    }

    comment.content = data.content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate("author", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    };
  } catch (error) {
    console.error("UPDATE COMMENT ERROR:", error);
    return {
      success: false,
      message: "Failed to update comment",
      error: error.message,
    };
  }
};

// Delete comment (soft delete)
export const deleteCommentService = async (commentId, userId) => {
  try {
    const comment = await Comment.findOne({
      _id: commentId,
      author: userId,
      isDeleted: false,
    });

    if (!comment) {
      return {
        success: false,
        message: "Comment not found or unauthorized",
      };
    }

    comment.isDeleted = true;
    await comment.save();

    // Decrement comment count on post
    const post = await Post.findById(comment.post);
    if (post) {
      await post.decrementComments();
    }

    // If this is a reply, decrement parent comment's replies count
    if (comment.parentComment) {
      const parent = await Comment.findById(comment.parentComment);
      if (parent) {
        await parent.decrementReplies();
      }
    }

    return {
      success: true,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);
    return {
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    };
  }
};

// Like/Unlike comment
export const toggleLikeCommentService = async (commentId, userId) => {
  try {
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return {
        success: false,
        message: "Comment not found",
      };
    }

    const existingLike = await Like.findOne({
      user: userId,
      targetType: "Comment",
      targetId: commentId,
    });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      await comment.decrementLikes();

      return {
        success: true,
        message: "Comment unliked",
        data: { liked: false },
      };
    } else {
      // Like
      await Like.create({
        user: userId,
        targetType: "Comment",
        targetId: commentId,
      });
      await comment.incrementLikes();

      return {
        success: true,
        message: "Comment liked",
        data: { liked: true },
      };
    }
  } catch (error) {
    console.error("TOGGLE LIKE COMMENT ERROR:", error);
    return {
      success: false,
      message: "Failed to toggle like",
      error: error.message,
    };
  }
};

