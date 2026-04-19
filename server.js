import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import jobRoutes from "./src/routes/job.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import bookmarkRoutes from "./src/routes/bookmark.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import communityRoutes from "./src/routes/community.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import connectionRoutes from "./src/routes/connection.routes.js";
import resumeRoutes from "./src/routes/resume.routes.js";
import collaborationRoutes from "./src/routes/collaboration.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import activityRoutes from "./src/routes/activity.routes.js";
import exploreRoutes from "./src/routes/explore.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import companyRoutes from "./src/routes/company.routes.js";
import collegeRoutes from "./src/routes/college.routes.js";
import assessmentRoutes from './src/routes/assessment.routes.js';
import automationRoutes from './src/routes/automation.routes.js';
import feedbackRoutes from './src/routes/feedback.routes.js';
import otpRoutes from "./src/routes/otp.routes.js";
import adminRoutes from "./src/routes/admin/admin.routes.js"
import dotenv from "dotenv";
import adminAuthRoutes from './src/routes/admin/admin.auth.routes.js';

// import adminRoutes from './';
import cookieParser from "cookie-parser"
dotenv.config();

const app = express();
app.use(cookieParser());

// CRITICAL: CORS Configuration for Production
const allowedOrigins = [
  "https://spreadnext.com",
  "https://www.spreadnext.com",
  "http://localhost:3000",
  "http://localhost:3001",
  
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 86400, 
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Parse JSON and URL-encoded bodies (MUST come before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for FormData text fields

// Database connection
connectDB();

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Spreadnext API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    database: "connected",
  });
});

// Routes
app.use("/api/user", authRoutes);
app.use("/api/interfeed", feedbackRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/otp/", otpRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/admin-auth/", adminAuthRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/conversations", messageRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/college", collegeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});
