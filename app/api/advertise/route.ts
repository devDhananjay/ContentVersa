import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/mailer";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { saveContactSubmission } from "@/lib/data/contact-submissions";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(""),
  company: z.string().min(1).max(160),
  website: z.string().max(300).optional().default(""),
  adType: z.string().min(1).max(80),
  budget: z.string().max(80).optional().default(""),
  placements: z.string().max(400).optional().default(""),
  message: z.string().min(10).max(5000),
});

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Advertising inquiry form — emails writewith@ and stores in contact inbox. */
export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());

    const subject = `Advertise: ${body.company} · ${body.adType}`;
    const details = [
      `Company: ${body.company}`,
      body.phone ? `Phone: ${body.phone}` : null,
      body.website ? `Website: ${body.website}` : null,
      `Ad format: ${body.adType}`,
      body.budget ? `Budget: ${body.budget}` : null,
      body.placements ? `Placements: ${body.placements}` : null,
      "",
      body.message,
    ]
      .filter((line): line is string => line != null)
      .join("\n");

    const html = `
      <h2>New advertising request</h2>
      <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>
      <p><strong>Company:</strong> ${escapeHtml(body.company)}</p>
      ${body.phone ? `<p><strong>Phone:</strong> ${escapeHtml(body.phone)}</p>` : ""}
      ${body.website ? `<p><strong>Website:</strong> ${escapeHtml(body.website)}</p>` : ""}
      <p><strong>Ad format:</strong> ${escapeHtml(body.adType)}</p>
      ${body.budget ? `<p><strong>Budget:</strong> ${escapeHtml(body.budget)}</p>` : ""}
      ${body.placements ? `<p><strong>Placements:</strong> ${escapeHtml(body.placements)}</p>` : ""}
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(body.message)}</p>
    `;

    const sent = await sendEmail({
      to: CONTACT_EMAIL,
      subject: `[ContentVerse India Advertise] ${subject}`,
      html,
      text: `From: ${body.name} <${body.email}>\n${details}`,
      replyTo: body.email,
    });

    const saved = await saveContactSubmission({
      name: body.name,
      email: body.email,
      subject,
      message: details,
      emailed: sent,
    });

    console.info("[advertise]", {
      at: new Date().toISOString(),
      from: body.email,
      company: body.company,
      adType: body.adType,
      emailed: sent,
      saved: Boolean(saved),
    });

    if (!sent && !saved) {
      return NextResponse.json(
        { error: "Could not send request right now. Please email us directly." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, emailed: sent });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please fill all required fields correctly" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
