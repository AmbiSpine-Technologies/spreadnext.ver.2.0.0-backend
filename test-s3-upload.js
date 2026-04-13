import "dotenv/config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./src/services/s3.client.js";

const run = async () => {
  try {
    console.log("S3 CONFIG =>", {
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `manual-test-${Date.now()}.txt`,
      Body: Buffer.from("Spreadnext manual S3 test"),
      ContentType: "text/plain"
    });

    const result = await s3.send(command);
    console.log("UPLOAD SUCCESS:", result);
  } catch (err) {
    console.error("UPLOAD FAILED:", err);
  }
};

run();
