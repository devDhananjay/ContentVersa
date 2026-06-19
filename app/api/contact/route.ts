import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/mailer";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { saveContactSubmission } from "@/lib/data/contact-submissions";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
});

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Contact form — emails writewith@contentverses.in (saved to DB as backup) */
export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());

    const html = `
      <h2>New contact form message</h2>
      <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>
      <p><strong>Subject:</strong> ${escapeHtml(body.subject)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(body.message)}</p>
    `;

    const sent = await sendEmail({
      to: CONTACT_EMAIL,
      subject: `[ContentVerse Contact] ${body.subject}`,
      html,
      text: `From: ${body.name} <${body.email}>\nSubject: ${body.subject}\n\n${body.message}`,
      replyTo: body.email,
    });

    const saved = await saveContactSubmission({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      emailed: sent,
    });

    console.info("[contact]", {
      at: new Date().toISOString(),
      from: body.email,
      name: body.name,
      subject: body.subject,
      emailed: sent,
      saved: Boolean(saved),
    });

    if (!sent && !saved) {
      return NextResponse.json(
        { error: "Could not send email right now. Please email us directly." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, emailed: sent });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please fill all fields correctly" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
