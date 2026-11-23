import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { sendSponsoredProposal } from "@/lib/notifications/send-proposal";

const Schema = z.object({
  blogId: z.string().min(1),
});

/** Admin: email the blog author a paid sponsored-content proposal via existing SMTP. */
export async function POST(req: Request) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    const body = Schema.parse(await req.json());
    const result = await sendSponsoredProposal(body.blogId);

    if (!result.ok) {
      const status =
        result.error === "Blog not found"
          ? 404
          : result.error?.includes("email on file")
            ? 400
            : 503;
      return NextResponse.json({ error: result.error || "Failed" }, { status });
    }

    return NextResponse.json({
      ok: true,
      emailed: true,
      to: result.to,
      authorName: result.authorName,
      from: result.from,
      replyTo: "support@vidyora.co.in",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[send-proposal]", err);
    return NextResponse.json({ error: "Failed to send proposal" }, { status: 500 });
  }
}
