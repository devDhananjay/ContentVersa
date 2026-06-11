import Link from "next/link";
import { redirect } from "next/navigation";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReelModerationQueue } from "@/components/admin/reel-moderation-queue";
import { getCurrentUser } from "@/lib/auth";
import { getAdminReelModerationQueue } from "@/lib/data/admin-data";

const ADMIN_ROLES = ["MODERATOR", "ADMIN", "SUPER_ADMIN"] as const;

export default async function ReelModerationPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/admin/reels-moderation");

  if (!ADMIN_ROLES.includes(session.role as (typeof ADMIN_ROLES)[number])) {
    redirect("/dashboard?error=admin_required");
  }

  const { pending, rejected } = await getAdminReelModerationQueue();

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Reel moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Approve or reject flagged reels before they go public.
          </p>
        </div>
        <Link href="/admin/moderation">
          <Button variant="outline" className="gap-1.5">
            <Film className="h-4 w-4" /> Blog queue
          </Button>
        </Link>
      </div>

      <ReelModerationQueue pending={pending} rejected={rejected} />
    </div>
  );
}
