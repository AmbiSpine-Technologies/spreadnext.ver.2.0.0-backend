import {
  createRepostService,
  removeRepostService,
} from "../services/repost.service.js";
import { MSG } from "../constants/messages.js";

// Create a repost
export const createRepost = async (req, res) => {
  try {
    const { id } = req.params; // post id
    const { caption } = req.body;

    const result = await createRepostService(id, caption, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE REPOST ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Remove repost
export const removeRepost = async (req, res) => {
  try {
    const { id } = req.params; // post id
    const result = await removeRepostService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("REMOVE REPOST ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









