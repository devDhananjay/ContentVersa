import {
  REEL_MAX_IMAGE_BYTES,
  REEL_MAX_VIDEO_BYTES,
  REEL_IMAGE_TYPES,
  REEL_VIDEO_TYPES,
} from "@/lib/reels/constants";

export type ReelUploadResult = {
  url: string;
  thumbnailUrl?: string;
  mediaType: "IMAGE" | "VIDEO";
  durationSec?: number;
  cloudinaryId?: string;
  size: number;
};

export async function uploadReelMedia(file: File): Promise<ReelUploadResult> {
  const isVideo = REEL_VIDEO_TYPES.has(file.type);
  const isImage = REEL_IMAGE_TYPES.has(file.type);

  if (!isVideo && !isImage) {
    throw new Error("Only MP4, WebM, MOV videos or JPEG, PNG, WebP, GIF images are supported.");
  }

  const maxBytes = isVideo ? REEL_MAX_VIDEO_BYTES : REEL_MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File is larger than ${maxMb}MB.`);
  }

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/reels/upload", { method: "POST", body: fd });
  const raw = await res.text();
  let data: ReelUploadResult & { error?: string } = {} as ReelUploadResult & { error?: string };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    /* HTML error page */
  }

  if (!res.ok || !data.url) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }

  return data;
}
