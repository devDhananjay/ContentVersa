import { saveUploadedImage } from "@/lib/storage/save-upload";

/** Persist cover: upload data URLs to storage; reject placeholder URLs. */
export async function normalizeCoverImageUrl(
  coverImage: string | undefined
): Promise<string | undefined> {
  const raw = coverImage?.trim();
  if (!raw) return undefined;

  if (raw.includes("picsum.photos")) {
    return undefined;
  }

  if (!raw.startsWith("data:image/")) {
    return raw;
  }

  const match = raw.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) return undefined;

  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Cover image is larger than 5MB");
  }

  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const filename = `cover-${Date.now().toString(36)}.${ext}`;
  const { url } = await saveUploadedImage(buffer, filename, contentType);
  return url;
}
