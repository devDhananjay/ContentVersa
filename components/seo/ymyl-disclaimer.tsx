import Link from "next/link";

export type YmylKind = "finance" | "health" | "tax" | "schemes" | "general";

const COPY: Record<
  YmylKind,
  { title: string; body: string; sourcesLabel?: string; sources?: { href: string; label: string }[] }
> = {
  finance: {
    title: "Educational only — not investment advice",
    body: "ContentVerse India publishes general financial education. Nothing here is a buy/sell recommendation, portfolio advice, or a substitute for a SEBI-registered adviser. Markets involve risk; verify figures with your broker, bank, or official filings.",
    sourcesLabel: "Useful official sources",
    sources: [
      { href: "https://www.sebi.gov.in/", label: "SEBI" },
      { href: "https://www.rbi.org.in/", label: "RBI" },
      { href: "https://www.nseindia.com/", label: "NSE" },
    ],
  },
  tax: {
    title: "Tax estimates only — verify before filing",
    body: "Calculators and articles here are educational planning aids. Tax rules, slabs, and rebates change. Confirm liability on the Income Tax Department portal or with a qualified CA before you file or choose a regime.",
    sourcesLabel: "Official sources",
    sources: [
      { href: "https://www.incometax.gov.in/", label: "Income Tax portal" },
      { href: "https://www.gst.gov.in/", label: "GST portal" },
    ],
  },
  health: {
    title: "Not medical advice",
    body: "Health-related content on ContentVerse India is for general awareness only. It is not diagnosis, treatment, or a substitute for a licensed clinician. For symptoms or medication decisions, consult a qualified doctor.",
    sourcesLabel: "Trusted references",
    sources: [
      { href: "https://www.mohfw.gov.in/", label: "MoHFW" },
      { href: "https://www.who.int/", label: "WHO" },
    ],
  },
  schemes: {
    title: "Scheme explainers — check the official portal",
    body: "Eligibility, documents, and steps can change. Always confirm on the government scheme’s official website or helpline before you apply or pay any fee. ContentVerse India does not collect application fees for govt schemes.",
  },
  general: {
    title: "Educational content",
    body: "Information on ContentVerse India is for learning and convenience. Double-check critical decisions (money, health, legal, government filings) with official sources or qualified professionals.",
  },
};

/** Compact YMYL / AdSense-friendly disclaimer with optional official source links. */
export function YmylDisclaimer({
  kind = "general",
  className,
}: {
  kind?: YmylKind;
  className?: string;
}) {
  const copy = COPY[kind];
  return (
    <aside
      className={
        className ??
        "rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-muted-foreground"
      }
      role="note"
    >
      <p className="font-medium text-foreground">{copy.title}</p>
      <p className="mt-1.5 leading-relaxed">{copy.body}</p>
      <p className="mt-2 text-xs">Last reviewed: September 2026. Confirm live rules on official portals.</p>
      {copy.sources?.length ? (
        <p className="mt-2 text-xs">
          {copy.sourcesLabel}:{" "}
          {copy.sources.map((s, i) => (
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

export function ymylKindForBlogCategory(categorySlug: string): YmylKind | null {
  const c = categorySlug.toLowerCase();
  if (c === "finance" || c === "money" || c === "investing") return "finance";
  if (c === "health" || c === "wellness" || c === "medical") return "health";
  if (c === "tax" || c === "gst") return "tax";
  return null;
}
