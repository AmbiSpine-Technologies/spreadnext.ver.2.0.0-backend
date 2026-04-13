import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { multerUpload } from "../middlewares/upload.middleware.js";
import {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateMemberRole,
  removeMember,
  getCommunityFeed,
  createCommunityPost,
  getCommunityEvents,
  createCommunityEvent,
  getCommunityFiles,
  getCommunityChat,
  sendCommunityChat,
  getCommunityAnalytics,
} from "../controllers/community.controller.js";

const router = express.Router();

// Public routes
router.get("/", getCommunities); // Can be public
router.get("/:id", getCommunityById); // Can be public

// Protected routes
router.use(authMiddleware);

router.post("/",multerUpload.fields([
  { name: "bannerImage", maxCount: 1 },
  { name: "community_image", maxCount: 1 },
]), createCommunity);
router.put("/:id", updateCommunity);
router.delete("/:id", deleteCommunity);
router.post("/:id/join", joinCommunity);
router.post("/:id/leave", leaveCommunity);

// Members management
router.get("/:id/members", getCommunityMembers);
router.put("/:id/members/:userId", updateMemberRole);
router.delete("/:id/members/:userId", removeMember);

// Community feed
router.get("/:id/feed", getCommunityFeed);
router.post("/:id/posts", createCommunityPost);

// Events
router.get("/:id/events", getCommunityEvents);
router.post("/:id/events", createCommunityEvent);

// Files
router.get("/:id/files", getCommunityFiles);

// Chat
router.get("/:id/chat", getCommunityChat);
router.post("/:id/chat", sendCommunityChat);

// Analytics
router.get("/:id/analytics", getCommunityAnalytics);

export default router;


