import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

// Create a notification
export const createNotificationService = async (data) => {
  try {
    // Don't create notification if user is notifying themselves
    if (data.user.toString() === data.actor.toString()) {
      return { success: true, message: "Self-notification skipped" };
    }

    const notification = await Notification.create(data);
    return {
      success: true,
      message: "Notification created",
      data: notification,
    };
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    return {
      success: false,
      message: "Failed to create notification",
      error: error.message,
    };
  }
};

// Get notifications for a user
export const getNotificationsService = async (userId, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = { user: userId };

    // Filter by type
    if (filters.type) {
      query.type = filters.type;
    }

    // Filter by read status
    if (filters.read !== undefined) {
      query.read = filters.read === "true" || filters.read === true;
    }

    const notifications = await Notification.find(query)
      .populate("actor", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    return {
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    };
  }
};

// Get unread count
export const getUnreadCountService = async (userId) => {
  try {
    const count = await Notification.countDocuments({ user: userId, read: false });
    return {
      success: true,
      data: { unreadCount: count },
    };
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);
    return {
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    };
  }
};

// Mark notification as read
export const markAsReadService = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return {
        success: false,
        message: "Notification not found",
      };
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return {
      success: true,
      message: "Notification marked as read",
      data: notification,
    };
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    return {
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    };
  }
};

// Mark all notifications as read
export const markAllAsReadService = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    return {
      success: true,
      message: "All notifications marked as read",
      data: { updatedCount: result.modifiedCount },
    };
  } catch (error) {
    console.error("MARK ALL AS READ ERROR:", error);
    return {
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    };
  }
};

// Delete notification
export const deleteNotificationService = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return {
        success: false,
        message: "Notification not found",
      };
    }

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    return {
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    };
  }
};

// Helper: Create notification when someone likes a post
export const createLikeNotification = async (postId, authorId, actorId) => {
  try {
    return await createNotificationService({
      user: authorId,
      type: "like",
      actor: actorId,
      targetType: "Post",
      targetId: postId,
    });
  } catch (error) {
    console.error("Create like notification error:", error);
  }
};

// Helper: Create notification when someone comments
export const createCommentNotification = async (postId, commentId, authorId, actorId) => {
  try {
    return await createNotificationService({
      user: authorId,
      type: "comment",
      actor: actorId,
      targetType: "Post",
      targetId: postId,
      metadata: {
        commentId: commentId.toString(),
      },
    });
  } catch (error) {
    console.error("Create comment notification error:", error);
  }
};

// Helper: Create notification when someone reposts
export const createRepostNotification = async (postId, authorId, actorId) => {
  try {
    return await createNotificationService({
      user: authorId,
      type: "repost",
      actor: actorId,
      targetType: "Post",
      targetId: postId,
    });
  } catch (error) {
    console.error("Create repost notification error:", error);
  }
};

