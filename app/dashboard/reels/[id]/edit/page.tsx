import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { getUserReelById } from "@/lib/reels/data";
import { ReelEditForm } from "@/components/reels/reel-edit-form";

export default async function EditReelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/reels");

  const authorId = await requireUserId(session);
  const { id } = await params;
  const reel = await getUserReelById(id, authorId);
  if (!reel) notFound();

  return (
    <div className="container py-8 max-w-3xl">
      <ReelEditForm reel={reel} />
    </div>
  );
}
