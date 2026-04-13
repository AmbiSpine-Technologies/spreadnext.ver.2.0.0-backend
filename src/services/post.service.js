import Post from "../models/post.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import Repost from "../models/repost.model.js";
import User from "../models/user.model.js";
import {
  createLikeNotification,
  createRepostNotification,
} from "./notification.service.js";

// Create a new post
export const createPostService = async (data, userId) => {
  try {
    const post = await Post.create({
      ...data,
      author: userId,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "firstName lastName userName email profileImage")
      .populate("mentions", "firstName lastName userName");

    return {
      success: true,
      message: "Post created successfully",
      data: populatedPost,
    };
  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    return {
      success: false,
      message: "Failed to create post",
      error: error.message,
    };
  }
};

// Get all posts (feed) with pagination
export const getPostsService = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const query = { isDeleted: false };

    // Search filter
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Author filter
    if (filters.author) {
      query.author = filters.author;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const posts = await Post.find(query)
      .populate("author", "firstName lastName userName email profileImage")
      .populate("mentions", "firstName lastName userName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return {
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    };
  }
};

// Get single post by ID
export const getPostByIdService = async (postId, userId = null) => {
  try {
    const post = await Post.findOne({ _id: postId, isDeleted: false })
      .populate("author", "firstName lastName userName email profileImage")
      .populate("mentions", "firstName lastName userName")
      .lean();

    if (!post) {
      return {
        success: false,
        message: "Post not found",
      };
    }

    // Check if user liked this post
    if (userId) {
      const like = await Like.findOne({
        user: userId,
        targetType: "Post",
        targetId: postId,
      });
      post.isLiked = !!like;
    } else {
      post.isLiked = false;
    }

    // Increment view count
    await Post.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } });

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("GET POST BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch post",
      error: error.message,
    };
  }
};

// Update post
export const updatePostService = async (postId, data, userId) => {
  try {
    const post = await Post.findOne({ _id: postId, author: userId, isDeleted: false });

    if (!post) {
      return {
        success: false,
        message: "Post not found or unauthorized",
      };
    }

    Object.assign(post, data);
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "firstName lastName userName email profileImage")
      .populate("mentions", "firstName lastName userName");

    return {
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    };
  } catch (error) {
    console.error("UPDATE POST ERROR:", error);
    return {
      success: false,
      message: "Failed to update post",
      error: error.message,
    };
  }
};

// Delete post (soft delete)
export const deletePostService = async (postId, userId) => {
  try {
    const post = await Post.findOne({ _id: postId, author: userId, isDeleted: false });

    if (!post) {
      return {
        success: false,
        message: "Post not found or unauthorized",
      };
    }

    post.isDeleted = true;
    await post.save();

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    return {
      success: false,
      message: "Failed to delete post",
      error: error.message,
    };
  }
};

// Like/Unlike post
// export const toggleLikePostService = async (postId, userId) => {
//   try {
//     const post = await Post.findById(postId);
//     if (!post || post.isDeleted) {
//       return {
//         success: false,
//         message: "Post not found",
//       };
//     }

//     const existingLike = await Like.findOne({
//       user: userId,
//       targetType: "Post",
//       targetId: postId,
//     });

//     if (existingLike) {
//       // Unlike
//       await Like.findByIdAndDelete(existingLike._id);
//       await post.decrementLikes();

//       return {
//         success: true,
//         message: "Post unliked",
//         data: { liked: false },
//       };
//     } else {
//       // Like
//       await Like.create({
//         user: userId,
//         targetType: "Post",
//         targetId: postId,
//       });
//       await post.incrementLikes();

//       // Create notification
//       await createLikeNotification(postId, post.author.toString(), userId.toString());

//       return {
//         success: true,
//         message: "Post liked",
//         data: { liked: true },
//       };
//     }
//   } catch (error) {
//     console.error("TOGGLE LIKE ERROR:", error);
//     return {
//       success: false,
//       message: "Failed to toggle like",
//       error: error.message,
//     };
//   }
// };

export const toggleLikePostService = async (postId, userId, reaction = "like") => {
  try {
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return { success: false, message: "Post not found" };
    }

    const existingIndex = post.reactions.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    // 🔄 If user already reacted
    if (existingIndex !== -1) {
      const existingReaction = post.reactions[existingIndex];

      // Same reaction → remove (unlike)
      if (existingReaction.type === reaction) {
        post.reactions.splice(existingIndex, 1);
        post.likesCount = Math.max(0, post.likesCount - 1);

        await post.save();

        return {
          success: true,
          message: "Reaction removed",
          data: { liked: false },
        };
      }

      // Different reaction → update
      post.reactions[existingIndex].type = reaction;
      await post.save();

      return {
        success: true,
        message: "Reaction updated",
        data: { liked: true },
      };
    }

    // ❤️ New reaction
    post.reactions.push({ user: userId, type: reaction });
    post.likesCount += 1;

    await post.save();
    
 await createLikeNotification(postId, post.author.toString(), userId.toString());
    return {
      success: true,
      message: "Post reacted",
      data: { liked: true },
    };
  } catch (error) {
    console.error("TOGGLE REACTION ERROR:", error);
    return {
      success: false,
      message: "Failed to toggle reaction",
    };
  }
};


// Get reposts of a post
export const getRepostsService = async (postId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const reposts = await Repost.find({ originalPost: postId })
      .populate("user", "firstName lastName userName email profileImage")
      .populate("originalPost", "content author")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Repost.countDocuments({ originalPost: postId });

    return {
      success: true,
      data: reposts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET REPOSTS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch reposts",
      error: error.message,
    };
  }
};

