import nodemailer from "nodemailer";
import type Transporter from "nodemailer/lib/mailer";

let transporter: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD?.trim()
  );
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || "587");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: process.env.SMTP_PASSWORD!.trim(),
      },
    });
  }
  return transporter;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email] SMTP not configured — skipped:", input.subject, "→", input.to);
    }
    return false;
  }

  const from = process.env.EMAIL_FROM?.trim() || "writewith@contentverses.in";

  try {
    await transport.sendMail({
      from: `ContentVerse <${from}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text || stripHtml(input.html),
    });
    return true;
  } catch (err) {
    console.error("[email] send failed", input.to, err);
    return false;
  }
}

/** Send to many recipients (deduped). Returns count sent. */
export async function sendEmailBulk(
  recipients: string[],
  build: (email: string) => SendEmailInput
): Promise<number> {
  const unique = [...new Set(recipients.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  let sent = 0;
  for (const email of unique) {
    const ok = await sendEmail(build(email));
    if (ok) sent++;
  }
  return sent;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
