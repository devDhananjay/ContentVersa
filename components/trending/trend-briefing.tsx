import {
  localTrendSummary,
  summarizeTrend,
  type TrendNewsItem,
} from "@/lib/trending/google-trends";

type TrendInput = {
  title: string;
  traffic?: string;
  newsItems?: TrendNewsItem[];
};

export function TrendBriefingFallback({ trend }: { trend: TrendInput }) {
  return (
    <BriefingBody
      source="local"
      summary={localTrendSummary(trend)}
      pending
    />
  );
}

/** Streams after the page shell — may call Gemini with a short budget. */
export async function TrendBriefing({ trend }: { trend: TrendInput }) {
  const { summary, source } = await summarizeTrend(trend);
  return <BriefingBody source={source} summary={summary} />;
}

function BriefingBody({
  summary,
  source,
  pending = false,
}: {
  summary: string;
  source: "gemini" | "local";
  pending?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Why it&apos;s trending
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {pending
            ? "Loading briefing…"
            : source === "gemini"
              ? "AI briefing"
              : "Quick briefing"}
        </span>
      </div>
      <div className="space-y-3 text-muted-foreground leading-relaxed whitespace-pre-line">
        {summary}
      </div>
    </section>
  );
}
