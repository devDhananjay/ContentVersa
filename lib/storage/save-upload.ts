import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getUploadsDirectory } from "@/lib/storage/upload-dir";
import { isS3Configured, uploadToS3 } from "@/lib/storage/s3-upload";

/**
 * Storage priority:
 * 1. AWS S3 (production — set AWS_S3_BUCKET + credentials)
 * 2. Local disk via UPLOAD_DIR (EC2 fallback / dev)
 */
export async function saveUploadedImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string }> {
  const key = `uploads/${filename}`;

  if (isS3Configured()) {
    return uploadToS3(buffer, key, contentType);
  }

  const uploadsDir = getUploadsDirectory();
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return { url: `/uploads/${filename}` };
}
