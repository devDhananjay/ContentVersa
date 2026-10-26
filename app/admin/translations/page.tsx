import { Languages } from "lucide-react";
import { TranslationsQueue } from "@/components/admin/translations-queue";

export const dynamic = "force-dynamic";

export default function AdminTranslationsPage() {
  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold flex items-center gap-2">
          <Languages className="h-7 w-7" /> Hindi translations
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Review AI Hindi drafts. Approve to publish under{" "}
          <code className="text-xs">/hi/blog/…</code>. Money/jobs niches stay draft
          until you approve.
        </p>
      </div>
      <TranslationsQueue />
    </div>
  );
}
