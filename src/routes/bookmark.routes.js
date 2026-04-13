import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createBookmark,
  getBookmarks,
  checkBookmark,
  deleteBookmark,
  deleteBookmarkById,
} from "../controllers/bookmark.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", getBookmarks);
router.get("/check", checkBookmark);
router.post("/", createBookmark);
router.delete("/", deleteBookmark);
router.delete("/:id", deleteBookmarkById);

export default router;









