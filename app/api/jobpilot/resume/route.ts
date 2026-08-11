import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireJobPilotUser } from "@/lib/jobpilot/auth-token";
import { extractResumeText } from "@/lib/jobpilot/resume-extract";
import { jobPilotErrorResponse } from "@/lib/jobpilot/http";

export async function GET() {
  try {
    const user = await requireJobPilotUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ resume: null });
    }
    const resume = await prisma.jobPilotResume.findUnique({
      where: { userId: user.userId },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        extractedText: true,
        updatedAt: true,
      },
    });
    if (!resume) return NextResponse.json({ resume: null });
    return NextResponse.json({
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        preview: resume.extractedText.slice(0, 400),
        textLength: resume.extractedText.length,
        updatedAt: resume.updatedAt,
      },
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

    const contentType = req.headers.get("content-type") || "";
    let extractedText = "";
    let fileName: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const textField = form.get("text");
      if (typeof textField === "string" && textField.trim().length > 40) {
        extractedText = textField.trim();
        fileName = "pasted.txt";
      } else if (file && typeof file !== "string") {
        const blob = file as File;
        const buffer = Buffer.from(await blob.arrayBuffer());
        fileName = blob.name || "resume.pdf";
        extractedText = await extractResumeText(
          buffer,
          blob.type || "application/octet-stream",
          fileName
        );
      }
    } else {
      const body = (await req.json()) as { text?: string; fileName?: string };
      if (!body.text?.trim()) {
        return NextResponse.json({ error: "text or file required" }, { status: 400 });
      }
      extractedText = body.text.trim();
      fileName = body.fileName || "pasted.txt";
    }

    if (extractedText.length < 40) {
      return NextResponse.json(
        { error: "Resume text too short. Upload a fuller resume." },
        { status: 400 }
      );
    }

    const resume = await prisma.jobPilotResume.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        extractedText: extractedText.slice(0, 50000),
        fileName,
      },
      update: {
        extractedText: extractedText.slice(0, 50000),
        fileName,
      },
      select: {
        id: true,
        fileName: true,
        updatedAt: true,
        extractedText: true,
      },
    });

    return NextResponse.json({
      ok: true,
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        preview: resume.extractedText.slice(0, 400),
        textLength: resume.extractedText.length,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (err) {
    return jobPilotErrorResponse(err);
  }
}
