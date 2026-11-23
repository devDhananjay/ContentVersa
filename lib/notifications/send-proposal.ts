import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/mailer";
import { sponsoredProposalEmail } from "@/lib/email/templates";
import { BUSINESS_EMAIL } from "@/lib/site-contact";
import { getAppUrl } from "@/lib/app-url";
import { createUserNotification } from "@/lib/notifications/create";

function isRealEmail(email: string | null | undefined): email is string {
  const e = email?.trim().toLowerCase() ?? "";
  if (!e || !e.includes("@")) return false;
  if (e.endsWith("@phone.contentverse.local")) return false;
  return true;
}

/**
 * Email the blog author (who submitted/published the post) a paid sponsored-content proposal.
 * From / Reply-To: support@vidyora.co.in (official business mailbox).
 */
export async function sendSponsoredProposal(blogId: string): Promise<{
  ok: boolean;
  to?: string;
  authorName?: string | null;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  // Always resolve the blog's authorId → that user is the publisher/submitter.
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

  const site = getAppUrl();
  const { subject, html } = sponsoredProposalEmail({
    name: author.name,
    blogTitle: blog.title,
    advertiseUrl: `${site}/advertise`,
    contactEmail: BUSINESS_EMAIL,
  });

  const emailed = await sendEmail({
    to: author.email, // only the publisher/submitter
    subject,
    html,
    from: BUSINESS_EMAIL,
    fromName: "ContentVerse Business",
    replyTo: BUSINESS_EMAIL,
  });

  if (!emailed) {
    return { ok: false, error: "Could not send email right now. Please try again." };
  }

  console.info("[send-proposal]", {
    blogId: blog.id,
    authorId: author.id,
    to: author.email,
    from: BUSINESS_EMAIL,
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

  return { ok: true, to: author.email, authorName: author.name };
}
