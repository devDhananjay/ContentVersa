import { NextResponse } from "next/server";
import { z } from "zod";
import { JobPilotCoverStyle } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireJobPilotUser } from "@/lib/jobpilot/auth-token";
import { generateCoverLetter } from "@/lib/jobpilot/analyze";
import {
  assertCanCoverLetter,
  getUsageSnapshot,
  incrementCoverLetter,
} from "@/lib/jobpilot/quotas";
import { jobPilotErrorResponse } from "@/lib/jobpilot/http";

const BodySchema = z.object({
  analysisId: z.string().min(1),
  style: z.enum(["PROFESSIONAL", "SHORT", "STARTUP"]).default("PROFESSIONAL"),
});

export async function POST(req: Request) {
  try {
    const user = await requireJobPilotUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await assertCanCoverLetter(user.userId);

    const body = BodySchema.parse(await req.json());
    const [resume, analysis] = await Promise.all([
      prisma.jobPilotResume.findUnique({ where: { userId: user.userId } }),
      prisma.jobPilotAnalysis.findFirst({
        where: { id: body.analysisId, userId: user.userId },
      }),
    ]);

    if (!resume?.extractedText) throw new Error("NO_RESUME");
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const content = await generateCoverLetter({
      resumeText: resume.extractedText,
      jobTitle: analysis.jobTitle,
      company: analysis.company,
      jdText: analysis.jdText,
      style: body.style,
    });

    const letter = await prisma.jobPilotCoverLetter.create({
      data: {
        userId: user.userId,
        analysisId: analysis.id,
        style: body.style as JobPilotCoverStyle,
        content,
      },
    });

    await incrementCoverLetter(user.userId);
    const usage = await getUsageSnapshot(user.userId);

    return NextResponse.json({
      ok: true,
      coverLetter: {
        id: letter.id,
        style: letter.style,
        content: letter.content,
        createdAt: letter.createdAt,
      },
      usage,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return jobPilotErrorResponse(err);
  }
}
