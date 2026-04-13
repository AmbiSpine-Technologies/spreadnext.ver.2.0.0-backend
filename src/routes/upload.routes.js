import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  uploadImage,
  uploadVideo,
  uploadDocument,
  getUserFiles,
  deleteUploadedFile,
} from "../controllers/upload.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/image", uploadImage);
router.post("/video", uploadVideo);
router.post("/document", uploadDocument);
router.get("/files", getUserFiles);
router.delete("/:id", deleteUploadedFile);

export default router;

