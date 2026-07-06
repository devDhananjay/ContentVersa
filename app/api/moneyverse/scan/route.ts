import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  isScreenshotScanConfigured,
  scanExpenseScreenshot,
} from "@/lib/moneyverse/screenshot-scan";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export async function POST(req: Request) {
  if (!isScreenshotScanConfigured()) {
    return NextResponse.json(
      { error: "Screenshot scan needs GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in to scan screenshots" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload an image file" }, { status: 400 });
    }

    const mimeType = (file.type || "image/jpeg").toLowerCase();
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Use JPG, PNG or WebP screenshot" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const result = await scanExpenseScreenshot(mimeType, base64);
    if (!result) {
      return NextResponse.json(
        {
          error:
            "Could not read this screenshot. Try a clearer UPI / payment success screen.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[api/moneyverse/scan]", err);
    return NextResponse.json({ error: "Scan failed — try again" }, { status: 500 });
  }
}
