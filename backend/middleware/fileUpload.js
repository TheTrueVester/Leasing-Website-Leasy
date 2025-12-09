import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import multer, { memoryStorage } from "multer";

const { AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_ACCESS_KEY_SECRET } = process.env;

export let upload = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // Not more than 100MB
  },
});

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY_SECRET,
  },
  region: "eu-north-1",
});

export const uploadToS3 = async (file) => {
  if (!file) {
    return null;
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: AWS_BUCKET_NAME,
      Key: `${Date.now().toString()}-${file.originalname}`,
      Body: file.buffer,
      ACL: "public-read",
    },
    tags: [], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false, // optional manually handle dropped parts
  });

  try {
    const data = await upload.done();
    return data;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw new Error("File upload to S3 failed");
  }
};
