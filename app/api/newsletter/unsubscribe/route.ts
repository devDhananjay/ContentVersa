import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const row = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (row) {
    await prisma.newsletterSubscriber.delete({ where: { id } });
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Unsubscribed</title></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;text-align:center;padding:0 20px;">
<h1>Unsubscribed</h1>
<p>You will no longer receive ContentVerse newsletter emails.</p>
<p><a href="https://contentverse.co.in">Back to ContentVerse</a></p>
</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
