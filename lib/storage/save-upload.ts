import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { getUploadsDirectory } from "@/lib/storage/upload-dir";

export function isBlobStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

export async function saveUploadedImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string }> {
  if (isBlobStorageConfigured()) {
    const blob = await put(`uploads/${filename}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  if (isVercelRuntime()) {
    throw new Error(
      "BLOB_NOT_CONFIGURED: Enable Vercel Blob storage and set BLOB_READ_WRITE_TOKEN."
    );
  }

  const uploadsDir = getUploadsDirectory();
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return { url: `/uploads/${filename}` };
}
