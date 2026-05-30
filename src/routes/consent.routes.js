// routes/consentRoutes.js
import express from "express";
import { saveConsent, getConsent } from "../controllers/consent.controller.js";
import { protect } from "../middlewares/adminAuth.middleware.js";

const router = express.Router();
// /api/cookie/consent"
router.post("/consent", saveConsent);
router.get("/consent", protect, getConsent);

export default router;