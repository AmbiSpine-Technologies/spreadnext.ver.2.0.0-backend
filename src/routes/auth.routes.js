import express from "express";
import { sendOtpController, verifyOtpController, HRorTPOOtpController, HRorTPOverifyOtpController } from "../controllers/otp.controller.js";
import { registerUser, loginUser, getAllUsersController, checkUsernameController,  googleSignupController , googleLoginController, getInactiveUsers, resetPasswordController  } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);
router.post("/google-signup", googleSignupController);
router.post("/google-login", googleLoginController);

router.post("/reset-password", resetPasswordController);
router.post("/hrtpo-sent-otp", authMiddleware, HRorTPOOtpController);
router.post("/hrtpo-verify-otp", authMiddleware, HRorTPOverifyOtpController);
// get all users
router.get("/all", getAllUsersController);
router.get("/check/:username", checkUsernameController);

router.get("/inactive-users", getInactiveUsers);
export default router;
