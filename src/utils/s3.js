// import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
// });

// // Upload (folder is injected, not decided here)
// export const uploadToS3 = async (file, folder) => {
//   if (!folder) {
//     throw new Error("S3 folder is required");
//   }

//   const ext = file.originalname.split(".").pop();
//   const key = `${folder}/${uuidv4()}.${ext}`;

//   const command = new PutObjectCommand({
//     Bucket: process.env.S3_BUCKET,
//     Key: key,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   });

//   await s3.send(command);

//   return {
//     key,
//     url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
//   };
// };

// // Delete
// export const deleteFromS3 = async (key) => {
//   const command = new DeleteObjectCommand({
//     Bucket: process.env.S3_BUCKET,
//     Key: key,
//   });

//   await s3.send(command);
//   return true;
// };

// export default s3;


import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING.trim()
);

const s3 = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME.trim()
);

await s3.createIfNotExists();

export const uploadToS3 = async (file, folder) => {
  try {
    const ext = file.originalname.split(".").pop();

    const key = `${folder}/${uuidv4()}.${ext}`;

    const blockBlobClient = s3.getBlockBlobClient(key);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return {
      key,
      url: blockBlobClient.url,
    };
  } catch (error) {
    console.error("AZURE UPLOAD ERROR:", error);
    throw error;
  }
};

export const deleteFromS3 = async (key) => {
  const blockBlobClient = s3.getBlockBlobClient(key);
  await blockBlobClient.deleteIfExists();
  return true;
};

export default s3;