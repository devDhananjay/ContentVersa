import nodemailer from "nodemailer";
import type Transporter from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD?.trim()
  );
}

function smtpPorts(): number[] {
  const primary = Number(process.env.SMTP_PORT || "465");
  const ports = [primary, primary === 465 ? 587 : 465];
  return [...new Set(ports.filter((p) => p > 0))];
}

function createTransport(port: number): Transporter {
  const host = process.env.SMTP_HOST!.trim();
  const options: SMTPTransport.Options = {
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASSWORD!.trim(),
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
    tls: {
      minVersion: "TLSv1.2",
      servername: host,
    },
  };
  return nodemailer.createTransport(options);
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email] SMTP not configured — skipped:", input.subject, "→", input.to);
    }
    return false;
  }

  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER!.trim();
  const mail = {
    from: `ContentVerse <${from}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text || stripHtml(input.html),
    replyTo: input.replyTo,
  };

  for (const port of smtpPorts()) {
    const transport = createTransport(port);
    try {
      await transport.sendMail(mail);
      return true;
    } catch (err) {
      console.error(`[email] send failed on port ${port}`, input.to, err);
    } finally {
      transport.close();
    }
  }

  return false;
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
