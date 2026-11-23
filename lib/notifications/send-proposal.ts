import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/mailer";
import { sponsoredProposalEmail } from "@/lib/email/templates";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { getAppUrl } from "@/lib/app-url";
import { createUserNotification } from "@/lib/notifications/create";

/** Official proposals From — must match SMTP_USER domain (contentverses.in). */
const PROPOSAL_FROM = CONTACT_EMAIL; // writewith@contentverses.in

function isRealEmail(email: string | null | undefined): email is string {
  const e = email?.trim().toLowerCase() ?? "";
  if (!e || !e.includes("@")) return false;
  if (e.endsWith("@phone.contentverse.local")) return false;
  return true;
}

/**
 * Email the blog author a paid sponsored-content proposal.
 * From / Reply-To: writewith@contentverses.in (SMTP authenticated mailbox).
 */
export async function sendSponsoredProposal(blogId: string): Promise<{
  ok: boolean;
  to?: string;
  authorName?: string | null;
  from?: string;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: {
      id: true,
      title: true,
      authorId: true,
      author: { select: { id: true, email: true, name: true } },
    },
  });

  if (!blog) return { ok: false, error: "Blog not found" };

  const author = blog.author;
  if (!author || author.id !== blog.authorId) {
    return { ok: false, error: "Blog author could not be resolved" };
  }

  if (!isRealEmail(author.email)) {
    return { ok: false, error: "Author has no valid email on file" };
  }

  const fromAddr =
    process.env.EMAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    PROPOSAL_FROM;

  const site = getAppUrl();
  const { subject, html } = sponsoredProposalEmail({
    name: author.name,
    blogTitle: blog.title,
    advertiseUrl: `${site}/advertise`,
    contactEmail: fromAddr,
  });

  const emailed = await sendEmail({
    to: author.email,
    subject,
    html,
    from: fromAddr,
    fromName: "ContentVerse Business",
    replyTo: fromAddr,
  });

  if (!emailed) {
    return { ok: false, error: "Could not send email right now. Please try again." };
  }

  console.info("[send-proposal]", {
    blogId: blog.id,
    authorId: author.id,
    to: author.email,
    from: fromAddr,
  });

  await createUserNotification({
    userId: author.id,
    type: NotificationType.SYSTEM,
    title: "Sponsored publishing proposal",
    message:
      "We sent you a sponsored content proposal by email. Reply if you’d like paid publishing options.",
    link: "/advertise",
  }).catch((err) => {
    console.error("[send-proposal] notification failed", err);
  });

  return { ok: true, to: author.email, authorName: author.name, from: fromAddr };
}
