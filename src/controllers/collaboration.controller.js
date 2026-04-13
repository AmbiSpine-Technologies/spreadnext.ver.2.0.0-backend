import {
  createCollaborationService,
  getCollaborationsService,
  getCollaborationByIdService,
  updateCollaborationService,
  joinCollaborationService,
  leaveCollaborationService,
} from "../services/collaboration.service.js";
import { MSG } from "../constants/messages.js";

// Create collaboration
export const createCollaboration = async (req, res) => {
  try {
    const result = await createCollaborationService(req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE COLLABORATION ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get all collaborations
export const getCollaborations = async (req, res) => {
  try {
    const { userId, search, category, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (userId) filters.userId = userId;
    if (search) filters.search = search;
    if (category) filters.category = category;

    const result = await getCollaborationsService(filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COLLABORATIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get collaboration by ID
export const getCollaborationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;
    const result = await getCollaborationByIdService(id, userId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("GET COLLABORATION BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Update collaboration
export const updateCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateCollaborationService(id, req.body, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE COLLABORATION ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Join collaboration
export const joinCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await joinCollaborationService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("JOIN COLLABORATION ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Leave collaboration
export const leaveCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await leaveCollaborationService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("LEAVE COLLABORATION ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









