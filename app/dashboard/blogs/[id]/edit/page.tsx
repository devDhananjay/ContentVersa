import { BlogEditorForm } from "@/components/dashboard/blog-editor-form";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogEditorForm blogId={id} />;
}
