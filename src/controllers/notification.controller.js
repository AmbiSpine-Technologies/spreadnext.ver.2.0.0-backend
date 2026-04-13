import {
  getNotificationsService,
  getUnreadCountService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
} from "../services/notification.service.js";
import { MSG } from "../constants/messages.js";

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const { type, read, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (read !== undefined) filters.read = read;

    const result = await getNotificationsService(
      req.user._id,
      filters,
      parseInt(page),
      parseInt(limit)
    );
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const result = await getUnreadCountService(req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET UNREAD COUNT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await markAsReadService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("MARK AS READ ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const result = await markAllAsReadService(req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("MARK ALL AS READ ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteNotificationService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









