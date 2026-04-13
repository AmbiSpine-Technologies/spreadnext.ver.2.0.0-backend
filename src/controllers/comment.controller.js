import {
  createCommentValidation,
  updateCommentValidation,
} from "../validations/post.validation.js";
import {
  createCommentService,
  getCommentsService,
  getCommentRepliesService,
  updateCommentService,
  deleteCommentService,
  toggleLikeCommentService,
} from "../services/comment.service.js";
import { MSG } from "../constants/messages.js";

// Create a comment
export const createComment = async (req, res) => {
  try {
    const { id } = req.params; // post id
    console.log("bakend",req.body);
    const { error } = createCommentValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createCommentService(id, req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE COMMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { id } = req.params; // post id
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user ? req.user._id : null;

    const result = await getCommentsService(id, parseInt(page), parseInt(limit), userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get replies to a comment
export const getCommentReplies = async (req, res) => {
  try {
    const { id } = req.params; // comment id
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user ? req.user._id : null;

    const result = await getCommentRepliesService(id, parseInt(page), parseInt(limit), userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMENT REPLIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params; // comment id
    const { error } = updateCommentValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await updateCommentService(id, req.body, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE COMMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params; // comment id
    const result = await deleteCommentService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Like/Unlike comment
export const toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params; // comment id
    const result = await toggleLikeCommentService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("TOGGLE LIKE COMMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









