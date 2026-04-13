import UploadedFile from "../models/uploadedFile.model.js";
import { getFileUrl, deleteFile as deleteFileUtil } from "../middlewares/upload.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save file record to database
export const saveFileRecordService = async (file, req, type, relatedTo = null, relatedId = null) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let folder = "images";
    if (type === "video") folder = "videos";
    if (type === "document") folder = "documents";

    const url = `${baseUrl}/uploads/${folder}/${file.filename}`;

    const fileRecord = await UploadedFile.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: url,
      type: type,
      uploadedBy: req.user._id,
      relatedTo: relatedTo,
      relatedId: relatedId,
    });

    return {
      success: true,
      message: "File uploaded successfully",
      data: fileRecord,
    };
  } catch (error) {
    console.error("SAVE FILE RECORD ERROR:", error);
    return {
      success: false,
      message: "Failed to save file record",
      error: error.message,
    };
  }
};

// Get user's uploaded files
export const getUserFilesService = async (userId, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = { uploadedBy: userId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.relatedTo) {
      query.relatedTo = filters.relatedTo;
    }

    const files = await UploadedFile.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UploadedFile.countDocuments(query);

    return {
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET USER FILES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch files",
      error: error.message,
    };
  }
};

// Delete file
export const deleteFileService = async (fileId, userId) => {
  try {
    const file = await UploadedFile.findOne({
      _id: fileId,
      uploadedBy: userId,
    });

    if (!file) {
      return {
        success: false,
        message: "File not found or unauthorized",
      };
    }

    // Delete physical file
    const deleted = deleteFileUtil(file.path);
    if (!deleted) {
      console.warn("Physical file not found:", file.path);
    }

    // Delete database record
    await UploadedFile.findByIdAndDelete(fileId);

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("DELETE FILE ERROR:", error);
    return {
      success: false,
      message: "Failed to delete file",
      error: error.message,
    };
  }
};

