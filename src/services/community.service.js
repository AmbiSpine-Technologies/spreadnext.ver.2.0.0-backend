import mongoose from "mongoose";
import Community from "../models/community.model.js";
import CommunityMember from "../models/communityMember.model.js";
import CommunityPost from "../models/communityPost.model.js";
import CommunityEvent from "../models/communityEvent.model.js";
import CommunityFile from "../models/communityFile.model.js";
import CommunityChat from "../models/communityChat.model.js";
import User from "../models/user.model.js";

// Create community
export const createCommunityService = async (data, userId) => {
  try {
    const community = await Community.create({
      ...data,
      creator: userId,
    });

    // Add creator as admin member
    await CommunityMember.create({
      community: community._id,
      user: userId,
      role: "admin",
      status: "active",
    });

    // Increment members count
    community.membersCount = 1;
    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate("creator", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Community created successfully",
      data: populatedCommunity,
    };
  } catch (error) {
    console.error("CREATE COMMUNITY ERROR:", error);
    return {
      success: false,
      message: "Failed to create community",
      error: error.message,
    };
  }
};

// Get all communities
export const getCommunitiesService = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const query = { isActive: true };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.privacy) {
      query.privacy = filters.privacy;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    const communities = await Community.find(query)
      .populate("creator", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Community.countDocuments(query);

    return {
      success: true,
      data: communities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COMMUNITIES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    };
  }
};

// Get community by ID
export const getCommunityByIdService = async (communityId, userId = null) => {
  try {
    // Validate MongoDB ObjectId format
    if (!communityId || !mongoose.Types.ObjectId.isValid(communityId)) {
      return {
        success: false,
        message: "Invalid community ID format",
      };
    }

    const community = await Community.findById(communityId)
      .populate("creator", "firstName lastName userName email profileImage")
      .lean();

    if (!community || !community.isActive) {
      return {
        success: false,
        message: "Community not found or inactive",
      };
    }

    // Check if user is a member
    if (userId) {
      const membership = await CommunityMember.findOne({
        community: communityId,
        user: userId,
      });
      community.isMember = !!membership;
      community.memberRole = membership?.role || null;
      community.memberStatus = membership?.status || null;
    }

    return {
      success: true,
      data: community,
    };
  } catch (error) {
    console.error("GET COMMUNITY BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch community",
      error: error.message,
    };
  }
};

// Update community
export const updateCommunityService = async (communityId, data, userId) => {
  try {
    // Check if user is admin
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: "admin",
      status: "active",
    });

    if (!membership) {
      return {
        success: false,
        message: "Unauthorized - Admin access required",
      };
    }

    const community = await Community.findByIdAndUpdate(
      communityId,
      { $set: data },
      { new: true }
    )
      .populate("creator", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Community updated successfully",
      data: community,
    };
  } catch (error) {
    console.error("UPDATE COMMUNITY ERROR:", error);
    return {
      success: false,
      message: "Failed to update community",
      error: error.message,
    };
  }
};

// Delete community
export const deleteCommunityService = async (communityId, userId) => {
  try {
    // Check if user is creator or admin
    const community = await Community.findById(communityId);
    if (!community) {
      return {
        success: false,
        message: "Community not found",
      };
    }

    const isCreator = community.creator.toString() === userId.toString();
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: "admin",
    });

    if (!isCreator && !membership) {
      return {
        success: false,
        message: "Unauthorized - Only creator or admin can delete",
      };
    }

    community.isActive = false;
    await community.save();

    return {
      success: true,
      message: "Community deleted successfully",
    };
  } catch (error) {
    console.error("DELETE COMMUNITY ERROR:", error);
    return {
      success: false,
      message: "Failed to delete community",
      error: error.message,
    };
  }
};

// Join community
export const joinCommunityService = async (communityId, userId) => {
  try {
    const community = await Community.findById(communityId);
    if (!community || !community.isActive) {
      return {
        success: false,
        message: "Community not found",
      };
    }

    // Check if already a member
    const existing = await CommunityMember.findOne({
      community: communityId,
      user: userId,
    });

    if (existing) {
      if (existing.status === "banned") {
        return {
          success: false,
          message: "You are banned from this community",
        };
      }
      if (existing.status === "active") {
        return {
          success: false,
          message: "You are already a member",
        };
      }
      // Reactivate if left
      existing.status = "active";
      await existing.save();
    } else {
      // Check if requires approval
      const requiresApproval = community.settings?.requireApproval || false;
      await CommunityMember.create({
        community: communityId,
        user: userId,
        role: "member",
        status: requiresApproval ? "pending" : "active",
      });
    }

    // Update members count
    const activeMembers = await CommunityMember.countDocuments({
      community: communityId,
      status: "active",
    });
    community.membersCount = activeMembers;
    await community.save();

    return {
      success: true,
      message: requiresApproval
        ? "Join request submitted. Waiting for approval."
        : "Joined community successfully",
    };
  } catch (error) {
    console.error("JOIN COMMUNITY ERROR:", error);
    return {
      success: false,
      message: "Failed to join community",
      error: error.message,
    };
  }
};

// Leave community
export const leaveCommunityService = async (communityId, userId) => {
  try {
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: userId,
    });

    if (!membership) {
      return {
        success: false,
        message: "You are not a member of this community",
      };
    }

    // Don't allow creator to leave
    const community = await Community.findById(communityId);
    if (community.creator.toString() === userId.toString()) {
      return {
        success: false,
        message: "Community creator cannot leave",
      };
    }

    membership.status = "left";
    await membership.save();

    // Update members count
    const activeMembers = await CommunityMember.countDocuments({
      community: communityId,
      status: "active",
    });
    community.membersCount = activeMembers;
    await community.save();

    return {
      success: true,
      message: "Left community successfully",
    };
  } catch (error) {
    console.error("LEAVE COMMUNITY ERROR:", error);
    return {
      success: false,
      message: "Failed to leave community",
      error: error.message,
    };
  }
};

// Get community members
export const getCommunityMembersService = async (
  communityId,
  filters = {},
  page = 1,
  limit = 20
) => {
  try {
    const skip = (page - 1) * limit;
    const query = { community: communityId, status: "active" };

    if (filters.role) {
      query.role = filters.role;
    }

    const members = await CommunityMember.find(query)
      .populate("user", "firstName lastName userName email profileImage")
      .sort({ role: 1, joinedAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommunityMember.countDocuments(query);

    return {
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COMMUNITY MEMBERS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch members",
      error: error.message,
    };
  }
};

// Update member role
export const updateMemberRoleService = async (communityId, targetUserId, newRole, adminUserId) => {
  try {
    // Check if admin is actually an admin
    const adminMembership = await CommunityMember.findOne({
      community: communityId,
      user: adminUserId,
      role: { $in: ["admin", "moderator"] },
      status: "active",
    });

    if (!adminMembership) {
      return {
        success: false,
        message: "Unauthorized - Admin or moderator access required",
      };
    }

    // Only admin can assign admin role
    if (newRole === "admin" && adminMembership.role !== "admin") {
      return {
        success: false,
        message: "Only admins can assign admin role",
      };
    }

    const membership = await CommunityMember.findOneAndUpdate(
      {
        community: communityId,
        user: targetUserId,
      },
      { role: newRole },
      { new: true }
    )
      .populate("user", "firstName lastName userName email profileImage")
      .lean();

    if (!membership) {
      return {
        success: false,
        message: "Member not found",
      };
    }

    return {
      success: true,
      message: "Member role updated successfully",
      data: membership,
    };
  } catch (error) {
    console.error("UPDATE MEMBER ROLE ERROR:", error);
    return {
      success: false,
      message: "Failed to update member role",
      error: error.message,
    };
  }
};

// Remove member
export const removeMemberService = async (communityId, targetUserId, adminUserId) => {
  try {
    // Check if admin is actually an admin
    const adminMembership = await CommunityMember.findOne({
      community: communityId,
      user: adminUserId,
      role: { $in: ["admin", "moderator"] },
      status: "active",
    });

    if (!adminMembership) {
      return {
        success: false,
        message: "Unauthorized - Admin or moderator access required",
      };
    }

    const membership = await CommunityMember.findOneAndDelete({
      community: communityId,
      user: targetUserId,
    });

    if (!membership) {
      return {
        success: false,
        message: "Member not found",
      };
    }

    // Update members count
    const community = await Community.findById(communityId);
    const activeMembers = await CommunityMember.countDocuments({
      community: communityId,
      status: "active",
    });
    community.membersCount = activeMembers;
    await community.save();

    return {
      success: true,
      message: "Member removed successfully",
    };
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);
    return {
      success: false,
      message: "Failed to remove member",
      error: error.message,
    };
  }
};

// Get community feed (posts)
export const getCommunityFeedService = async (communityId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find({
      community: communityId,
      status: "published",
    })
      .populate("author", "firstName lastName userName email profileImage")
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommunityPost.countDocuments({
      community: communityId,
      status: "published",
    });

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
    console.error("GET COMMUNITY FEED ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch community feed",
      error: error.message,
    };
  }
};

// Create community post
export const createCommunityPostService = async (communityId, data, userId) => {
  try {
    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      status: "active",
    });

    if (!membership) {
      return {
        success: false,
        message: "You must be a member to post",
      };
    }

    const post = await CommunityPost.create({
      ...data,
      community: communityId,
      author: userId,
      status: "published", // Can be changed to pending if approval required
    });

    // Increment posts count
    await Community.findByIdAndUpdate(communityId, { $inc: { postsCount: 1 } });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate("author", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Post created successfully",
      data: populatedPost,
    };
  } catch (error) {
    console.error("CREATE COMMUNITY POST ERROR:", error);
    return {
      success: false,
      message: "Failed to create post",
      error: error.message,
    };
  }
};

// Get community events
export const getCommunityEventsService = async (communityId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const now = new Date();

    const events = await CommunityEvent.find({
      community: communityId,
      isActive: true,
      startDate: { $gte: now },
    })
      .populate("createdBy", "firstName lastName userName email profileImage")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommunityEvent.countDocuments({
      community: communityId,
      isActive: true,
      startDate: { $gte: now },
    });

    return {
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COMMUNITY EVENTS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    };
  }
};

// Create community event
export const createCommunityEventService = async (communityId, data, userId) => {
  try {
    // Check if user is admin or moderator
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: { $in: ["admin", "moderator"] },
      status: "active",
    });

    if (!membership) {
      return {
        success: false,
        message: "Only admins and moderators can create events",
      };
    }

    const event = await CommunityEvent.create({
      ...data,
      community: communityId,
      createdBy: userId,
    });

    const populatedEvent = await CommunityEvent.findById(event._id)
      .populate("createdBy", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Event created successfully",
      data: populatedEvent,
    };
  } catch (error) {
    console.error("CREATE COMMUNITY EVENT ERROR:", error);
    return {
      success: false,
      message: "Failed to create event",
      error: error.message,
    };
  }
};

// Get community files
export const getCommunityFilesService = async (communityId, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = { community: communityId };

    if (filters.category) {
      query.category = filters.category;
    }

    const files = await CommunityFile.find(query)
      .populate("uploadedBy", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommunityFile.countDocuments(query);

    return {
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COMMUNITY FILES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch files",
      error: error.message,
    };
  }
};

// Get community chat messages
export const getCommunityChatService = async (communityId, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const messages = await CommunityChat.find({
      community: communityId,
      isDeleted: false,
    })
      .populate("sender", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommunityChat.countDocuments({
      community: communityId,
      isDeleted: false,
    });

    return {
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COMMUNITY CHAT ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch chat messages",
      error: error.message,
    };
  }
};

// Send community chat message
export const sendCommunityChatService = async (communityId, data, userId) => {
  try {
    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      status: "active",
    });

    if (!membership) {
      return {
        success: false,
        message: "You must be a member to send messages",
      };
    }

    const message = await CommunityChat.create({
      ...data,
      community: communityId,
      sender: userId,
    });

    const populatedMessage = await CommunityChat.findById(message._id)
      .populate("sender", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    };
  } catch (error) {
    console.error("SEND COMMUNITY CHAT ERROR:", error);
    return {
      success: false,
      message: "Failed to send message",
      error: error.message,
    };
  }
};

// Get community analytics
export const getCommunityAnalyticsService = async (communityId, userId) => {
  try {
    // Check if user is admin
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: "admin",
      status: "active",
    });

    if (!membership) {
      return {
        success: false,
        message: "Unauthorized - Admin access required",
      };
    }

    const [
      totalMembers,
      activeMembers,
      totalPosts,
      totalEvents,
      totalFiles,
      recentMembers,
    ] = await Promise.all([
      CommunityMember.countDocuments({ community: communityId }),
      CommunityMember.countDocuments({ community: communityId, status: "active" }),
      CommunityPost.countDocuments({ community: communityId, status: "published" }),
      CommunityEvent.countDocuments({ community: communityId, isActive: true }),
      CommunityFile.countDocuments({ community: communityId }),
      CommunityMember.find({ community: communityId })
        .populate("user", "firstName lastName userName")
        .sort({ joinedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalPosts,
        totalEvents,
        totalFiles,
        recentMembers,
      },
    };
  } catch (error) {
    console.error("GET COMMUNITY ANALYTICS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    };
  }
};


