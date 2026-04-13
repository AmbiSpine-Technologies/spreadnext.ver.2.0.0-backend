import {
  createResumeService,
  getResumesService,
  getResumeByIdService,
  getResumeByShareTokenService,
  updateResumeService,
  deleteResumeService,
  generateShareTokenService,
  getTemplatesService,
  generatePdfService,
} from "../services/resume.service.js";
import { MSG } from "../constants/messages.js";

// Create resume
export const createResume = async (req, res) => {
  try {
    const result = await createResumeService(req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE RESUME ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get user's resumes
export const getResumes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getResumesService(req.user._id, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET RESUMES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get resume by ID
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;
    const result = await getResumeByIdService(id, userId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("GET RESUME BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get resume by share token (public)
export const getResumeByShareToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await getResumeByShareTokenService(token);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("GET RESUME BY SHARE TOKEN ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Update resume
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateResumeService(id, req.body, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE RESUME ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteResumeService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE RESUME ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Generate PDF
export const generatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await generatePdfService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GENERATE PDF ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get templates
export const getTemplates = async (req, res) => {
  try {
    const result = await getTemplatesService();
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET TEMPLATES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Generate share token
export const generateShareToken = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await generateShareTokenService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GENERATE SHARE TOKEN ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









