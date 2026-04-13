import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkConnection,
  getFriendSuggestions,
  searchUsers,
} from "../controllers/connection.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/suggestions", getFriendSuggestions);
router.get("/search", searchUsers);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);
router.get("/:userId/check", checkConnection);
router.post("/:userId", followUser);
router.delete("/:userId", unfollowUser);

export default router;









