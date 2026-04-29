import express from "express";
import { handleContactForm, submitRequirement, submitEarlyAccess } from "../controllers/contact.controller.js";
import { multerUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// "attachment" wahi name hona chahiye jo frontend ke FormData mein hai /api/contact/submitEarlyAccess"
router.post("/submit", multerUpload.single("attachment"), handleContactForm);
router.post("/request-submit", submitRequirement);
router.post("/submitEarlyAccess", submitEarlyAccess )
export default router;