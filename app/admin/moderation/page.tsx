import Link from "next/link";
import { redirect } from "next/navigation";
import { Flag, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { getCurrentUser } from "@/lib/auth";

const ADMIN_ROLES = ["MODERATOR", "ADMIN", "SUPER_ADMIN"] as const;
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapDbBlogToBlog } from "@/lib/data/blog-db";

const blogInclude = {
  author: { include: { profile: true } },
  category: true,
} as const;

export default async function ModerationPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/admin/moderation");

  if (!ADMIN_ROLES.includes(session.role as (typeof ADMIN_ROLES)[number])) {
    redirect("/dashboard?error=admin_required");
  }

  const sp = (await searchParams) || {};
  const tabParam = sp.tab === "proposals" || sp.tab === "rejected" ? sp.tab : "pending";

  let pending: Parameters<typeof ModerationQueue>[0]["pending"] = [];
  let rejected: Parameters<typeof ModerationQueue>[0]["rejected"] = [];

  if (isDatabaseConfigured()) {
    const [pendingRows, rejectedRows] = await Promise.all([
      prisma.blog.findMany({
        where: { status: "PENDING" },
        include: blogInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.blog.findMany({
        where: { status: "REJECTED" },
        include: blogInclude,
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
    ]);

    pending = pendingRows.map((b) => ({
      ...mapDbBlogToBlog(b),
      status: b.status,
      blogId: b.id,
    }));
    rejected = rejectedRows.map((b) => ({
      ...mapDbBlogToBlog(b),
      status: b.status,
      blogId: b.id,
    }));
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Moderation queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Approve or reject blog submissions before they go public.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/moderation?tab=proposals">
            <Button variant="outline" className="gap-1.5">
              <Send className="h-4 w-4" /> Proposals sent
            </Button>
          </Link>
          <Link href="/admin/reels-moderation">
            <Button variant="outline" className="gap-1.5">
              <Flag className="h-4 w-4" /> Reel queue
            </Button>
          </Link>
          <Link href="/admin/blogs">
            <Button variant="outline" className="gap-1.5">
              <FileText className="h-4 w-4" /> All blogs
            </Button>
          </Link>
        </div>
      </div>

      <ModerationQueue
        pending={pending}
        rejected={rejected}
        initialTab={tabParam}
      />
    </div>
  );
}
