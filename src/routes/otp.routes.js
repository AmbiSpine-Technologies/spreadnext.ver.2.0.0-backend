import express from "express";
import {
  passwordSendOtpController,
  verifyOtpController
} from "../controllers/otp.controller.js";

const router = express.Router();

router.post("/password-reset-send-otp", passwordSendOtpController);
router.post("/verify-otp", verifyOtpController);

export default router;