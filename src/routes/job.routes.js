import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  getFeaturedJobs,
  toggleJobStatus,
  getJobsAppliedController,
   requestVerification, validateOTP,
   getTrendingJobs,
  // make sure this is exported in job.controller.js
} from "../controllers/job.controller.js";
import {
  createJobApplication,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/jobApplication.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { multerUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/all", getAllJobs);
router.get("/featured", getFeaturedJobs);
router.get("/trending", getTrendingJobs);
router.get("/:id", getJobById);

// Protected routes
router.post("/create", authMiddleware, createJob);
router.get("/my/jobs", authMiddleware, getMyJobs);
router.get("/my/jobs/jobseeker/count", authMiddleware, getJobsAppliedController);
router.put("/update/:id", authMiddleware, updateJob);
router.delete("/delete/:id", authMiddleware, deleteJob);
router.patch("/toggle-status/:id", authMiddleware, toggleJobStatus);
router.post("/send-verification-otp", requestVerification);
router.post("/verify-otp-and-post", validateOTP);


// Job Applications routes
router.post("/:id/apply", authMiddleware, multerUpload.single("resume"), createJobApplication);
router.get("/applications/my", authMiddleware, getMyApplications);
router.get("/:id/applications", authMiddleware, getJobApplications);
router.get("/applications/:id", authMiddleware, getApplicationById);
router.put("/applications/:id/status", authMiddleware, updateApplicationStatus);
router.delete("/applications/:id/withdraw", authMiddleware, withdrawApplication);

export default router;

