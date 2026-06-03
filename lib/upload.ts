// Client-side helper for uploading images to /api/upload

export interface UploadedImage {
  url: string;
  size: number;
  type: string;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is larger than 5MB.");
  }

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    size?: number;
    type?: string;
    error?: string;
  };

  if (!res.ok || !data.url) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }

  return { url: data.url, size: data.size ?? file.size, type: data.type ?? file.type };
}

/** Upload a data URL or remote image URL — returns a permanent hosted URL. */
export async function uploadImageFromUrl(imageUrl: string): Promise<UploadedImage> {
  if (imageUrl.includes("picsum.photos")) {
    throw new Error(
      "This is a placeholder image, not real AI art. Set GEMINI_API_KEY and generate again."
    );
  }

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Could not read image for upload");

  const blob = await res.blob();
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is larger than 5MB.");
  }

  const ext = blob.type.split("/")[1] || "png";
  const file = new File([blob], `ai-cover.${ext}`, {
    type: blob.type || "image/png",
  });

  return uploadImage(file);
}
