import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  getReposts,
} from "../controllers/post.controller.js";
import {
  createComment,
  getComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleLikeComment,
} from "../controllers/comment.controller.js";
import {
  createRepost,
  removeRepost,
} from "../controllers/repost.controller.js";
import {
  createStory,
  getStories,
  getStoryById,
  viewStory,
  deleteStory,
  getStoryViewers,
} from "../controllers/story.controller.js";
import {
  createPostReport,
  createCommentReport,
  createStoryReport,
  getReports,
} from "../controllers/report.controller.js";

const router = express.Router();
import { multerUpload } from "../middlewares/upload.middleware.js";


router.post("/create-post", authMiddleware,  multerUpload.array("media", 5), createPost);
router.get("/posts/all", getPosts);


// ==================== STORY ROUTES (Specific routes first) ====================
router.get("/stories/all", getStories); // Get all stories - can be public
router.post("/stories", authMiddleware, createStory);
router.get("/stories/:id/viewers", authMiddleware, getStoryViewers); // Specific route before :id
router.post("/stories/:id/view", authMiddleware, viewStory); // Mark story as viewed
router.post("/stories/:id/report", authMiddleware, createStoryReport); // Report a story
router.get("/stories/:id", getStoryById); // Get single story - can be public
router.delete("/stories/:id", authMiddleware, deleteStory);

// ==================== COMMENT ROUTES (Specific routes first) ====================
// Comment-specific routes (comments have their own IDs) - specific routes first
router.put("/comments/:id", authMiddleware, updateComment);
router.delete("/comments/:id", authMiddleware, deleteComment);
router.post("/comments/:id/like", authMiddleware, toggleLikeComment);
router.post("/comments/:id/report", authMiddleware, createCommentReport); // Report a comment
router.get("/comments/:id/replies", getCommentReplies); // Get replies to a comment

// ==================== REPORT ROUTES ====================
router.get("/reports/all", authMiddleware, getReports); // Get all reports (admin)

// ==================== POST ROUTES ====================
// Public routes
router.get("/", getPosts); // Get all posts (feed) - can be public or with auth

// Protected routes (require authentication) - specific routes before :id
router.post("/", authMiddleware, createPost);
router.get("/:id/comments", getComments); // Get comments - can be public
router.post("/:id/comments", authMiddleware, createComment);
router.get("/:id/reposts", getReposts); // Can be public
router.post("/:id/repost", authMiddleware, createRepost);
router.delete("/:id/repost", authMiddleware, removeRepost);
router.post("/:id/like", authMiddleware, toggleLikePost);
router.post("/:id/report", authMiddleware, createPostReport); // Report a post
router.get("/:id", getPostById); // Get single post - can be public or with auth
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;

