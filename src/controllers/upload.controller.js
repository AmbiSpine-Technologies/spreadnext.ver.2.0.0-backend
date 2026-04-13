import { multerUpload } from "../middlewares/upload.middleware.js";
import { saveFileRecordService, getUserFilesService, deleteFileService } from "../services/upload.service.js";
import { MSG } from "../constants/messages.js";

// Upload single image
export const uploadImage = async (req, res) => {
  try {
    const uploadSingle = multerUpload.single("image");
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await saveFileRecordService(req.file, req, "image");
      res.status(result.success ? 201 : 400).json(result);
    });
  } catch (err) {
    console.error("UPLOAD IMAGE ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Upload single video
export const uploadVideo = async (req, res) => {
  try {
    const uploadSingle = multerUpload.single("video");
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await saveFileRecordService(req.file, req, "video");
      res.status(result.success ? 201 : 400).json(result);
    });
  } catch (err) {
    console.error("UPLOAD VIDEO ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Upload single document
export const uploadDocument = async (req, res) => {
  try {
    const uploadSingle = multerUpload.single("document");
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await saveFileRecordService(req.file, req, "document");
      res.status(result.success ? 201 : 400).json(result);
    });
  } catch (err) {
    console.error("UPLOAD DOCUMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get user's uploaded files
export const getUserFiles = async (req, res) => {
  try {
    const { type, relatedTo, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (relatedTo) filters.relatedTo = relatedTo;

    const result = await getUserFilesService(req.user._id, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET USER FILES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete file
export const deleteUploadedFile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteFileService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE FILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

