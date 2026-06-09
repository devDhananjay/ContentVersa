import { createHash } from "node:crypto";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
  return { cloudName, apiKey, apiSecret };
}

function signParams(params: Record<string, string | number>, apiSecret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(sorted + apiSecret).digest("hex");
}

export type CloudinaryUploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
};

export async function uploadToCloudinary(
  buffer: Buffer,
  opts: { resourceType: "image" | "video"; filename?: string }
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "contentverse/reels";

  const params: Record<string, string | number> = {
    folder,
    timestamp,
  };
  const signature = signParams(params, apiSecret);

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), opts.filename || "reel");
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${opts.resourceType}/upload`;
  const res = await fetch(endpoint, { method: "POST", body: form });
  const data = (await res.json()) as {
    error?: { message?: string };
    public_id?: string;
    url?: string;
    secure_url?: string;
    resource_type?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
    duration?: number;
  };

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  const publicId = data.public_id!;
  let thumbnailUrl: string | undefined;
  if (opts.resourceType === "video") {
    thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_400,h_711,c_fill/${publicId}.jpg`;
  }

  return {
    publicId,
    url: data.url!,
    secureUrl: data.secure_url,
    resourceType: opts.resourceType,
    format: data.format || "",
    bytes: data.bytes || buffer.length,
    width: data.width,
    height: data.height,
    duration: data.duration,
    thumbnailUrl,
  };
}
