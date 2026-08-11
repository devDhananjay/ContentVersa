import { NextResponse } from "next/server";
import { z } from "zod";
import { JobPilotSource } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireJobPilotUser } from "@/lib/jobpilot/auth-token";
import { analyzeJobAgainstResume } from "@/lib/jobpilot/analyze";
import {
  assertCanAnalyze,
  getUsageSnapshot,
  incrementAnalysis,
} from "@/lib/jobpilot/quotas";
import { jobPilotErrorResponse } from "@/lib/jobpilot/http";

const BodySchema = z.object({
  url: z.string().url().or(z.string().min(1)),
  source: z.enum(["LINKEDIN", "NAUKRI", "OTHER"]).default("OTHER"),
  title: z.string().min(1).max(300),
  company: z.string().max(200).optional().nullable(),
  jdText: z.string().min(40).max(50000),
});

export async function POST(req: Request) {
  try {
    const user = await requireJobPilotUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await assertCanAnalyze(user.userId);

    const resume = await prisma.jobPilotResume.findUnique({
      where: { userId: user.userId },
    });
    if (!resume?.extractedText) throw new Error("NO_RESUME");

    const body = BodySchema.parse(await req.json());
    const result = await analyzeJobAgainstResume({
      resumeText: resume.extractedText,
      jobTitle: body.title,
      company: body.company,
      jdText: body.jdText,
    });

    const analysis = await prisma.jobPilotAnalysis.create({
      data: {
        userId: user.userId,
        jobUrl: body.url,
        source: body.source as JobPilotSource,
        jobTitle: body.title,
        company: body.company || null,
        jdText: body.jdText.slice(0, 50000),
        matchScore: result.matchScore,
        skillsMatched: result.skillsMatched,
        skillsMissing: result.skillsMissing,
        experienceMatch: result.experienceMatch,
        atsScore: result.atsScore,
        shouldApply: result.shouldApply,
      },
    });

    await incrementAnalysis(user.userId);
    const usage = await getUsageSnapshot(user.userId);

    return NextResponse.json({
      ok: true,
      analysis: {
        id: analysis.id,
        jobUrl: analysis.jobUrl,
        source: analysis.source,
        jobTitle: analysis.jobTitle,
        company: analysis.company,
        matchScore: result.matchScore,
        skillsMatched: result.skillsMatched,
        skillsMissing: result.skillsMissing,
        experienceMatch: result.experienceMatch,
        atsScore: result.atsScore,
        shouldApply: result.shouldApply,
        suggestedImprovement: result.suggestedImprovement,
        createdAt: analysis.createdAt,
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
