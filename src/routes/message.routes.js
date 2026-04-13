import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createOrGetConversation,
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  getUnreadCount,
} from "../controllers/message.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", getConversations);
router.post("/", createOrGetConversation);
router.get("/:id", getConversationById);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);
router.put("/messages/:id", updateMessage);
router.delete("/messages/:id", deleteMessage);
router.post("/messages/:id/read", markMessageAsRead);
router.get("/:id/unread", getUnreadCount);

export default router;









