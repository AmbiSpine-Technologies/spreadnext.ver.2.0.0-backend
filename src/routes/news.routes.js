import express from "express";
import * as newsController from "../controllers/admin/news.controller.js";

const router = express.Router();

// Public Routes
router.get("/feed", newsController.getNewsList); // Get all news with filters
router.get("/feed/:slug", newsController.getNewsDetails); // Detail page


export default router;