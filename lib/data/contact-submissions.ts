import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const INBOX_KEY = "contact.submissions";
const MAX_SUBMISSIONS = 200;

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  emailed: boolean;
  createdAt: string;
};

function parseInbox(value: unknown): ContactSubmission[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is ContactSubmission =>
      !!row &&
      typeof row === "object" &&
      typeof (row as ContactSubmission).id === "string" &&
      typeof (row as ContactSubmission).email === "string"
  );
}

export async function saveContactSubmission(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  emailed: boolean;
}): Promise<ContactSubmission | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const existing = await prisma.siteSetting.findUnique({ where: { key: INBOX_KEY } });
    const list = parseInbox(existing?.valueJson);
    const entry: ContactSubmission = {
      id: `c_${Date.now().toString(36)}`,
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      emailed: input.emailed,
      createdAt: new Date().toISOString(),
    };

    const next = [entry, ...list].slice(0, MAX_SUBMISSIONS);
    await prisma.siteSetting.upsert({
      where: { key: INBOX_KEY },
      create: { key: INBOX_KEY, valueJson: next },
      update: { valueJson: next },
    });

    return entry;
  } catch (err) {
    console.error("[contact] save submission failed", err);
    return null;
  }
}
