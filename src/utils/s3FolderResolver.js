import { S3_FOLDERS } from "../constants/s3Folders.js";

export const resolveS3Folder = ({ fieldname, mimetype }) => {
  // 🔹 Profile specific uploads (by field name)
  if (fieldname === "profileImage") {
    return S3_FOLDERS.PROFILE.IMAGE;
  }

  if (fieldname === "profileCover") {
    return S3_FOLDERS.PROFILE.COVER;
  }

  // 🔹 MIME based fallback
  if (mimetype.startsWith("image/")) {
    return S3_FOLDERS.GENERAL_IMAGES;
  }

  if (mimetype === "application/pdf") {
    return S3_FOLDERS.PDFS;
  }

  // 🔹 Default
  return S3_FOLDERS.DOCUMENTS.RESUME;
};
