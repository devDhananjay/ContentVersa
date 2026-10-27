import { BlogEditorForm } from "@/components/dashboard/blog-editor-form";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export default async function CreatePage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <div className="container max-w-6xl pt-8 pb-2">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          {t(dict, "dashPages.createTitle")}
        </h1>
      </div>
      <BlogEditorForm />
    </>
  );
}
