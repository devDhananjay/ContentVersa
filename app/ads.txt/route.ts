import { NextResponse } from "next/server";

/** Google Ad Manager / AdSense certification authority ID */
const GOOGLE_CERT_ID = "f08c47fec0942fa0";

function adsensePublisherId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim();
  if (!raw) return null;
  const normalized = raw.replace(/^ca-pub-/i, "pub-");
  return normalized.startsWith("pub-") ? normalized : `pub-${normalized}`;
}

export async function GET() {
  const pubId = adsensePublisherId();
  if (!pubId) {
    return new NextResponse("# AdSense publisher ID not configured\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const body = `google.com, ${pubId}, DIRECT, ${GOOGLE_CERT_ID}\n`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
