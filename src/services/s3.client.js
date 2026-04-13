import dotenv from "dotenv";
dotenv.config();

// src/services/s3.client.js
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Create a reusable S3 client
 * Uses environment variables or EC2 IAM Role automatically
 */

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default s3;
