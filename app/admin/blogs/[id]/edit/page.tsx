import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { BlogEditorForm } from "@/components/dashboard/blog-editor-form";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/admin/blogs");
  if (!isAdminRole(session.role)) redirect("/dashboard?error=admin_required");

  const { id } = await params;
  if (!id) notFound();

  return <BlogEditorForm blogId={id} adminMode />;
}
