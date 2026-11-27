import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import {
  listProposalSends,
  sendSponsoredProposal,
} from "@/lib/notifications/send-proposal";

const Schema = z.object({
  blogId: z.string().min(1),
});

/** List sent sponsored proposals (newest first). */
export async function GET(req: Request) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const data = await listProposalSends(Number.isFinite(limit) ? limit : 100);
    return NextResponse.json({ data, count: data.length });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[send-proposal] list", err);
    return NextResponse.json({ error: "Failed to load proposals" }, { status: 500 });
  }
}

/** Admin: email the blog author a paid sponsored-content proposal via existing SMTP. */
export async function POST(req: Request) {
  try {
    const admin = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    const body = Schema.parse(await req.json());
    const result = await sendSponsoredProposal({
      blogId: body.blogId,
      sentById: admin.sub,
    });

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
      proposalId: result.proposalId,
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
