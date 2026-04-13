import Post from "../models/post.model.js";
import Job from "../models/job.model.js";
import Community from "../models/community.model.js";
import CommunityMember from "../models/communityMember.model.js";
import CommunityPost from "../models/communityPost.model.js";
import CommunityEvent from "../models/communityEvent.model.js";
import CommunityFile from "../models/communityFile.model.js";
import Profile from "../models/profile.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import Connection from "../models/connection.model.js";
import JobApplication from "../models/jobApplication.model.js";

// Get profile analytics
export const getProfileAnalyticsService = async (userId) => {
  try {
    const [
      totalPosts,
      totalLikes,
      totalComments,
      totalFollowers,
      totalFollowing,
      profileViews,
    ] = await Promise.all([
      Post.countDocuments({ author: userId, isDeleted: false }),
      Like.countDocuments({ targetType: "Post", targetId: { $in: await Post.find({ author: userId }).distinct("_id") } }),
      Comment.countDocuments({ author: userId, isDeleted: false }),
      Connection.countDocuments({ following: userId, status: "accepted" }),
      Connection.countDocuments({ follower: userId, status: "accepted" }),
      0, // Profile views would need a separate model
    ]);

    // Get posts engagement (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPosts = await Post.find({
      author: userId,
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: false,
    }).lean();

    const recentPostIds = recentPosts.map((p) => p._id);
    const recentLikes = await Like.countDocuments({
      targetType: "Post",
      targetId: { $in: recentPostIds },
    });
    const recentComments = await Comment.countDocuments({
      post: { $in: recentPostIds },
      isDeleted: false,
    });

    return {
      success: true,
      data: {
        totalPosts,
        totalLikes,
        totalComments,
        totalFollowers,
        totalFollowing,
        profileViews,
        recentEngagement: {
          posts: recentPosts.length,
          likes: recentLikes,
          comments: recentComments,
        },
      },
    };
  } catch (error) {
    console.error("GET PROFILE ANALYTICS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch profile analytics",
      error: error.message,
    };
  }
};

// Get community analytics
export const getCommunityAnalyticsService = async (communityId, userId) => {
  try {
    // Verify user is admin (this check should be done in controller)
    const [
      totalMembers,
      activeMembers,
      totalPosts,
      totalEvents,
      totalFiles,
    ] = await Promise.all([
      CommunityMember.countDocuments({ community: communityId }),
      CommunityMember.countDocuments({ community: communityId, status: "active" }),
      CommunityPost.countDocuments({ community: communityId, status: "published" }),
      CommunityEvent.countDocuments({ community: communityId, isActive: true }),
      CommunityFile.countDocuments({ community: communityId }),
    ]);

    // Get growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newMembers = await CommunityMember.countDocuments({
      community: communityId,
      joinedAt: { $gte: thirtyDaysAgo },
    });

    const newPosts = await CommunityPost.countDocuments({
      community: communityId,
      createdAt: { $gte: thirtyDaysAgo },
      status: "published",
    });

    return {
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalPosts,
        totalEvents,
        totalFiles,
        growth: {
          newMembers,
          newPosts,
        },
      },
    };
  } catch (error) {
    console.error("GET COMMUNITY ANALYTICS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch community analytics",
      error: error.message,
    };
  }
};

// Get job analytics
export const getJobAnalyticsService = async (jobId, userId) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    // Verify user is job poster
    if (job.postedBy.toString() !== userId.toString()) {
      return {
        success: false,
        message: "Unauthorized - Only job poster can view analytics",
      };
    }

    const [
      totalApplications,
      applicationsByStatus,
      totalViews,
    ] = await Promise.all([
      JobApplication.countDocuments({ job: jobId }),
      JobApplication.aggregate([
        { $match: { job: jobId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      job.views || 0,
    ]);

    return {
      success: true,
      data: {
        totalApplications,
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalViews,
        applicationsCount: job.applicationsCount || 0,
      },
    };
  } catch (error) {
    console.error("GET JOB ANALYTICS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch job analytics",
      error: error.message,
    };
  }
};

