import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getActivities,
  getActivitiesByType,
} from "../controllers/activity.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", getActivities);
router.get("/:type", getActivitiesByType);

export default router;









