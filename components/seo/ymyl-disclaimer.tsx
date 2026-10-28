"use client";

import Link from "next/link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { tf } from "@/lib/i18n/get-dictionary";
import type { YmylKind } from "@/lib/seo/ymyl";

export type { YmylKind };

const SOURCE_LINKS: Record<
  Exclude<YmylKind, "general">,
  { href: string; label: string }[]
> = {
  finance: [
    { href: "https://www.sebi.gov.in/", label: "SEBI" },
    { href: "https://www.rbi.org.in/", label: "RBI" },
    { href: "https://www.irdai.gov.in/", label: "IRDAI" },
    { href: "https://www.nseindia.com/", label: "NSE" },
  ],
  tax: [
    { href: "https://www.incometax.gov.in/", label: "Income Tax portal" },
    { href: "https://www.gst.gov.in/", label: "GST portal" },
  ],
  health: [
    { href: "https://www.mohfw.gov.in/", label: "MoHFW" },
    { href: "https://www.irdai.gov.in/", label: "IRDAI" },
    { href: "https://www.who.int/", label: "WHO" },
  ],
  schemes: [
    { href: "https://www.india.gov.in/", label: "India.gov.in" },
    { href: "https://www.ibps.in/", label: "IBPS" },
    { href: "https://ssc.gov.in/", label: "SSC" },
  ],
};

function ymylKeys(kind: YmylKind): { title: string; body: string; sources?: string } {
  switch (kind) {
    case "finance":
      return {
        title: "ymyl.financeTitle",
        body: "ymyl.financeBody",
        sources: "ymyl.financeSources",
      };
    case "tax":
      return {
        title: "ymyl.taxTitle",
        body: "ymyl.taxBody",
        sources: "ymyl.taxSources",
      };
    case "health":
      return {
        title: "ymyl.healthTitle",
        body: "ymyl.healthBody",
        sources: "ymyl.healthSources",
      };
    case "schemes":
      return {
        title: "ymyl.schemesTitle",
        body: "ymyl.schemesBody",
        sources: "ymyl.schemesSources",
      };
    default:
      return { title: "ymyl.generalTitle", body: "ymyl.generalBody" };
  }
}

/** Compact YMYL / AdSense-friendly disclaimer with optional official source links. */
export function YmylDisclaimer({
  kind = "general",
  className,
  reviewedLabel = "October 2026",
}: {
  kind?: YmylKind;
  className?: string;
  /** Shown as “Last reviewed: …” — pass article.updatedLabel on money pages */
  reviewedLabel?: string;
}) {
  const { dict, t } = useDictionary();
  const keys = ymylKeys(kind);
  const sources =
    kind !== "general" ? SOURCE_LINKS[kind as Exclude<YmylKind, "general">] : undefined;

  return (
    <aside
      className={
        className ??
        "rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-muted-foreground"
      }
      role="note"
    >
      <p className="font-medium text-foreground">{t(keys.title)}</p>
      <p className="mt-1.5 leading-relaxed">{t(keys.body)}</p>
      <p className="mt-2 text-xs">
        {tf(dict, "ymyl.reviewed", { date: reviewedLabel })}
      </p>
      {sources?.length && keys.sources ? (
        <p className="mt-2 text-xs">
          {t(keys.sources)}:{" "}
          {sources.map((s, i) => (
            <span key={s.href}>
              {i > 0 ? " · " : null}
              <Link
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {s.label}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </aside>
  );
}

