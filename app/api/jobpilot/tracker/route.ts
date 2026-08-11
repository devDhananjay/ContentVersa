import { NextResponse } from "next/server";
import { z } from "zod";
import { JobPilotAppStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireJobPilotUser } from "@/lib/jobpilot/auth-token";
import { jobPilotErrorResponse } from "@/lib/jobpilot/http";

const CreateSchema = z.object({
  analysisId: z.string().optional().nullable(),
  title: z.string().min(1).max(300),
  company: z.string().max(200).optional().nullable(),
  url: z.string().optional().nullable(),
  status: z
    .enum(["SAVED", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED"])
    .default("SAVED"),
  notes: z.string().max(5000).optional().nullable(),
});

const PatchSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum(["SAVED", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED"])
    .optional(),
  notes: z.string().max(5000).optional().nullable(),
  title: z.string().min(1).max(300).optional(),
  company: z.string().max(200).optional().nullable(),
});

function statsFromApps(
  apps: { status: JobPilotAppStatus }[]
) {
  const total = apps.length;
  const interviews = apps.filter(
    (a) => a.status === "INTERVIEW" || a.status === "OFFER"
  ).length;
  const offers = apps.filter((a) => a.status === "OFFER").length;
  const appliedish = apps.filter((a) => a.status !== "SAVED").length;
  const responded = apps.filter((a) =>
    ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"].includes(a.status)
  ).length;
  const responseRate =
    appliedish === 0 ? 0 : Math.round((responded / appliedish) * 100);

  return { total, interviews, offers, responseRate };
}

export async function GET() {
  try {
    const user = await requireJobPilotUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ applications: [], stats: statsFromApps([]) });
    }

    const applications = await prisma.jobPilotApplication.findMany({
      where: { userId: user.userId },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      applications,
      stats: statsFromApps(applications),
    });
  } catch (err) {
    return jobPilotErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireJobPilotUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = CreateSchema.parse(await req.json());

    if (body.analysisId) {
      const analysis = await prisma.jobPilotAnalysis.findFirst({
        where: { id: body.analysisId, userId: user.userId },
      });
      if (!analysis) {
        return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
      }
    }

    const status = body.status as JobPilotAppStatus;
    const app = await prisma.jobPilotApplication.create({
      data: {
        userId: user.userId,
        analysisId: body.analysisId || null,
        title: body.title,
        company: body.company || null,
        url: body.url || null,
        status,
        notes: body.notes || null,
        appliedAt: status === "APPLIED" || status === "SCREENING" ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true, application: app });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return jobPilotErrorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireJobPilotUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = PatchSchema.parse(await req.json());
    const existing = await prisma.jobPilotApplication.findFirst({
      where: { id: body.id, userId: user.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const status = body.status as JobPilotAppStatus | undefined;
    const app = await prisma.jobPilotApplication.update({
      where: { id: existing.id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.company !== undefined ? { company: body.company } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(status
          ? {
              status,
              appliedAt:
                status === "APPLIED" && !existing.appliedAt
                  ? new Date()
                  : existing.appliedAt,
            }
          : {}),
      },
    });

    return NextResponse.json({ ok: true, application: app });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return jobPilotErrorResponse(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireJobPilotUser();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await prisma.jobPilotApplication.deleteMany({
      where: { id, userId: user.userId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jobPilotErrorResponse(err);
  }
}
