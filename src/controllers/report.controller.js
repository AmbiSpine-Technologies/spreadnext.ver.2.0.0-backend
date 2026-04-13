import {
  reportContentValidation,
} from "../validations/post.validation.js";
import {
  createReportService,
  getReportsService,
} from "../services/report.service.js";
import { MSG } from "../constants/messages.js";

// Create a report for a post
export const createPostReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = reportContentValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createReportService(
      {
        ...req.body,
        targetId: id,
        targetType: "Post",
      },
      req.user._id
    );
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE REPORT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Create a report for a comment
export const createCommentReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = reportContentValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createReportService(
      {
        ...req.body,
        targetId: id,
        targetType: "Comment",
      },
      req.user._id
    );
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE REPORT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Create a report for a story
export const createStoryReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = reportContentValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createReportService(
      {
        ...req.body,
        targetId: id,
        targetType: "Story",
      },
      req.user._id
    );
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE REPORT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get all reports (admin only - add admin check if needed)
export const getReports = async (req, res) => {
  try {
    const {
      status,
      targetType,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (targetType) filters.targetType = targetType;

    const result = await getReportsService(filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET REPORTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};
