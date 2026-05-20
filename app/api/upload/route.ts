import { NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/storage/save-upload";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function safeSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "image";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided in `file` field" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is larger than 5MB" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = EXT_BY_TYPE[file.type] || "bin";
    const filename = `${Date.now().toString(36)}-${safeSlug(file.name)}.${ext}`;

    const { url } = await saveUploadedImage(buffer, filename, file.type);
    return NextResponse.json({ ok: true, url, size: file.size, type: file.type });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload] failed", err);

    if (msg.includes("BLOB_NOT_CONFIGURED")) {
      return NextResponse.json(
        {
          error:
            "Image storage is not set up on production. In Vercel: Storage → Blob → Connect, then redeploy.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
