import { NotificationType, UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/mailer";
import { blogPendingReviewAdminEmail } from "@/lib/email/templates";
import { createUserNotificationsBulk } from "@/lib/notifications/create";
import { PLATFORM_OWNER_EMAIL } from "@/lib/owner";

const ADMIN_ROLES: UserRole[] = [
  UserRole.MODERATOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

/**
 * Email + in-app alert for admins/moderators when a user submits a blog for review.
 * Fire-and-forget safe — never throws to the caller.
 */
export async function notifyAdminsOfPendingBlog(blogId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        id: true,
        title: true,
        excerpt: true,
        status: true,
        author: { select: { id: true, name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    if (!blog || blog.status !== "PENDING") return;

    const admins = await prisma.user.findMany({
      where: { role: { in: ADMIN_ROLES } },
      select: { id: true, email: true },
    });

    const byEmail = new Map<string, { id?: string; email: string }>();
    for (const a of admins) {
      if (!a.email) continue;
      byEmail.set(a.email.toLowerCase(), { id: a.id, email: a.email });
    }

    const ownerEmail = PLATFORM_OWNER_EMAIL.toLowerCase();
    if (!byEmail.has(ownerEmail)) {
      byEmail.set(ownerEmail, { email: PLATFORM_OWNER_EMAIL });
    }

    // Don't email the author if they are also an admin reviewing their own draft path.
    byEmail.delete(blog.author.email?.toLowerCase() ?? "");

    const recipients = [...byEmail.values()];
    if (!recipients.length) return;

    const { subject, html } = blogPendingReviewAdminEmail({
      title: blog.title,
      blogId: blog.id,
      authorName: blog.author.name || "Creator",
      authorEmail: blog.author.email,
      excerpt: blog.excerpt,
      categoryName: blog.category?.name,
    });

    const link = `/admin/blogs/${blog.id}`;

    await Promise.all(
      recipients.map((r) =>
        sendEmail({ to: r.email, subject, html }).catch((err) => {
          console.error("[blog-pending-admin] email failed", r.email, err);
          return false;
        })
      )
    );

    const payloads = recipients
      .filter((r): r is { id: string; email: string } => Boolean(r.id))
      .map((r) => ({
        userId: r.id,
        type: NotificationType.SYSTEM,
        title: "Blog pending approval",
        message: `“${blog.title}” by ${blog.author.name || "a creator"} needs review.`,
        link,
      }));

    if (payloads.length) {
      await createUserNotificationsBulk(payloads).catch((err) => {
        console.error("[blog-pending-admin] notifications failed", err);
      });
    }
  } catch (err) {
    console.error("[blog-pending-admin]", err);
  }
}
