// Client-side helper for uploading an image to the local /api/upload route.
// Returns the public URL of the stored file.

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
