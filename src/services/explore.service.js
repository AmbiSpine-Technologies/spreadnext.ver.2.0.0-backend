import Post from "../models/post.model.js";
import Job from "../models/job.model.js";
import Community from "../models/community.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";

// Get trending content
export const getTrendingContentService = async (limit = 10) => {
  try {
    // Get trending posts (most liked/commented in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingPosts = await Post.find({
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: false,
    })
      .populate("author", "firstName lastName userName email profileImage")
      .sort({ likesCount: -1, commentsCount: -1 })
      .limit(limit)
      .lean();

    // Get trending jobs (most viewed/applied in last 7 days)
    const trendingJobs = await Job.find({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true,
    })
      .populate("postedBy", "firstName lastName userName")
      .sort({ views: -1, applicationsCount: -1 })
      .limit(limit)
      .lean();

    // Get trending communities (most members in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingCommunities = await Community.find({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true,
    })
      .populate("creator", "firstName lastName userName email profileImage")
      .sort({ membersCount: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: {
        trendingPosts,
        trendingJobs,
        trendingCommunities,
      },
    };
  } catch (error) {
    console.error("GET TRENDING CONTENT ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch trending content",
      error: error.message,
    };
  }
};

// Get trending jobs
export const getTrendingJobsService = async (limit = 10) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const jobs = await Job.find({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true,
      isFeatured: true,
    })
      .populate("postedBy", "firstName lastName userName")
      .sort({ views: -1, applicationsCount: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: jobs,
    };
  } catch (error) {
    console.error("GET TRENDING JOBS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch trending jobs",
      error: error.message,
    };
  }
};

// Get trending topics (from post tags)
export const getTrendingTopicsService = async (limit = 10) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = await Post.find({
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: false,
    })
      .select("tags")
      .lean();

    // Count tag occurrences
    const tagCounts = {};
    recentPosts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Sort by count and get top tags
    const trendingTopics = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({
        tag,
        count,
      }));

    return {
      success: true,
      data: trendingTopics,
    };
  } catch (error) {
    console.error("GET TRENDING TOPICS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch trending topics",
      error: error.message,
    };
  }
};

// Get personalized suggestions
export const getPersonalizedSuggestionsService = async (userId, limit = 10) => {
  try {
    // Get user's interests from profile
    const profile = await Profile.findOne({ userId }).lean();
    const userSkills = profile?.skills || [];
    const userInterests = profile?.interests || [];

    // Suggest jobs based on skills
    const suggestedJobs = await Job.find({
      isActive: true,
      skills: { $in: userSkills },
    })
      .populate("postedBy", "firstName lastName userName")
      .limit(limit)
      .lean();

    // Suggest communities based on interests
    const suggestedCommunities = await Community.find({
      isActive: true,
      tags: { $in: userInterests },
    })
      .populate("creator", "firstName lastName userName email profileImage")
      .limit(limit)
      .lean();

    return {
      success: true,
      data: {
        suggestedJobs,
        suggestedCommunities,
      },
    };
  } catch (error) {
    console.error("GET PERSONALIZED SUGGESTIONS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch suggestions",
      error: error.message,
    };
  }
};









