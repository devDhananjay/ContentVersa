import Link from "next/link";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocalePrefix } from "@/lib/i18n/config";

export function LocaleFallbackBanner({
  locale,
  usedFallback,
  translationStatus,
  slug,
}: {
  locale: AppLocale;
  usedFallback: boolean;
  translationStatus: string | null;
  slug: string;
}) {
  if (locale !== "hi") return null;
  const dict = getDictionary("hi");

  if (!usedFallback) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span>हिंदी संस्करण</span>
        <Link
          href={withLocalePrefix(`/blog/${slug}`, "en")}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          {t(dict, "common.switchToEnglish")}
        </Link>
      </div>
    );
  }

  const pending =
    translationStatus === "DRAFT" || translationStatus === "READY"
      ? t(dict, "common.translationPending")
      : t(dict, "common.hindiSoon");

  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
      <p>{pending}</p>
      <Link
        href={withLocalePrefix(`/blog/${slug}`, "en")}
        className="mt-1 inline-block font-medium underline-offset-2 hover:underline"
      >
        {t(dict, "common.switchToEnglish")}
      </Link>
    </div>
  );
}
