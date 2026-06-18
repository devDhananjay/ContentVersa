import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminBlogsTable } from "@/components/admin/admin-blogs-table";
import { getAdminBlogs, getAdminBlogsByStatus } from "@/lib/data/admin-data";

export default async function AdminBlogsPage() {
  const [all, byStatus] = await Promise.all([getAdminBlogs("ALL"), getAdminBlogsByStatus()]);

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Button>
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <FileText className="h-8 w-8 text-neon-purple" />
          All blogs
        </h1>
        <p className="text-muted-foreground mt-1">
          Click any post to read full content, author info, and approval history.
        </p>
      </div>

      <AdminBlogsTable
        all={all}
        pending={byStatus.pending}
        published={byStatus.published}
        rejected={byStatus.rejected}
        draft={byStatus.draft}
        archived={byStatus.archived}
      />
    </div>
  );
}
