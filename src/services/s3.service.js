// src/services/s3.service.js
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "./s3.client.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a file to S3
 * Automatically adds a UUID prefix to prevent collisions
 * @param {string} originalName - Original file name
 * @param {Buffer|string|ReadableStream} body - File content
 * @param {string} contentType - MIME type of file
 * @param {string} folder - Optional folder in bucket
 * @returns {object} S3 response with generated key
 */
export const uploadFile = async (originalName, body, contentType, folder = "") => {
  try {
    const key = folder ? `${folder}/${uuidv4()}-${originalName}` : `${uuidv4()}-${originalName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await s3.send(command);
    return { key, bucket: process.env.S3_BUCKET_NAME };
  } catch (err) {
    console.error("S3 Upload Error:", err);
    throw new Error("Failed to upload file to S3");
  }
};

/**
 * Download a file from S3
 * @param {string} key - File name in S3
 * @returns {ReadableStream} file stream
 */
export const getFile = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const result = await s3.send(command);
    return result.Body; // Readable stream
  } catch (err) {
    console.error("S3 Get Error:", err);
    throw new Error("Failed to download file from S3");
  }
};

/**
 * Delete a file from S3
 * @param {string} key - File name in S3
 * @returns S3 response
 */
export const deleteFile = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const result = await s3.send(command);
    return result;
  } catch (err) {
    console.error("S3 Delete Error:", err);
    throw new Error("Failed to delete file from S3");
  }
};

/**
 * Generate a pre-signed URL for private access
 * @param {string} key - File name in S3
 * @param {number} expiresIn - URL expiration in seconds (default 1 hour)
 * @returns {string} Signed URL
 */
export const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const url = await getSignedUr
