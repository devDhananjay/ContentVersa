import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import {
  REEL_IMAGE_TYPES,
  REEL_MAX_IMAGE_BYTES,
  REEL_MAX_VIDEO_BYTES,
  REEL_VIDEO_TYPES,
} from "@/lib/reels/constants";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireUser();

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            "Reel uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
        },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = REEL_VIDEO_TYPES.has(file.type);
    const isImage = REEL_IMAGE_TYPES.has(file.type);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 415 }
      );
    }

    const maxBytes = isVideo ? REEL_MAX_VIDEO_BYTES : REEL_MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File exceeds ${Math.round(maxBytes / (1024 * 1024))}MB limit` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, {
      resourceType: isVideo ? "video" : "image",
      filename: file.name,
    });

    return NextResponse.json({
      ok: true,
      url: result.secureUrl,
      thumbnailUrl: result.thumbnailUrl,
      mediaType: isVideo ? "VIDEO" : "IMAGE",
      durationSec: result.duration ? Math.round(result.duration) : undefined,
      cloudinaryId: result.publicId,
      size: result.bytes,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to upload reels" }, { status: 401 });
    }
    console.error("[reels/upload]", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
