// src/middlewares/upload.middleware.js
import multer from "multer";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import s3 from "../utils/s3.js";

// Raw Multer instance
const storage = multer.memoryStorage();
export const multerUpload = multer({ storage });

// Upload file to S3
export const uploadFileToS3 = async (file) => {
  if (!file) throw new Error("No file provided");
  const key = `${uuidv4()}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  await s3.send(command);
  return key;
};

// Delete file from S3
export const deleteFile = async (key) => {
  if (!key) return false;
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  await s3.send(command);
  return true;
};

// Generate signed URL
export const getFileUrl = async (key) => {
  if (!key) return null;
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};

