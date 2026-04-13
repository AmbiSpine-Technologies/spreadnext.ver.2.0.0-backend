import Report from "../models/report.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Story from "../models/story.model.js";

// Create a report
export const createReportService = async (data, userId) => {
  try {
    const { targetType, targetId, reason, description } = data;

    // Verify that the target exists
    let targetExists = false;
    switch (targetType) {
      case "Post":
        targetExists = await Post.findById(targetId);
        break;
      case "Comment":
        targetExists = await Comment.findById(targetId);
        break;
      case "User":
        targetExists = await User.findById(targetId);
        break;
      case "Story":
        targetExists = await Story.findById(targetId);
        break;
    }

    if (!targetExists) {
      return {
        success: false,
        message: "Target not found",
      };
    }

    // Check if user already reported this target
    const existingReport = await Report.findOne({
      reporter: userId,
      targetType,
      targetId,
    });

    if (existingReport) {
      return {
        success: false,
        message: "You have already reported this content",
      };
    }

    const report = await Report.create({
      reporter: userId,
      targetType,
      targetId,
      reason,
      description: description || "",
    });

    return {
      success: true,
      message: "Report submitted successfully",
      data: report,
    };
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "You have already reported this content",
      };
    }
    return {
      success: false,
      message: "Failed to submit report",
      error: error.message,
    };
  }
};

// Get all reports (admin only - you may want to add admin check)
export const getReportsService = async (filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.targetType) {
      query.targetType = filters.targetType;
    }

    const reports = await Report.find(query)
      .populate("reporter", "firstName lastName userName email")
      .populate("reviewedBy", "firstName lastName userName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments(query);

    return {
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    };
  }
};









