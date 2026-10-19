/**
 * Word-count audit for every /tools/[slug] page (guide + examples + FAQ).
 *
 *   npx tsx scripts/audit-tool-content.ts
 *   npx tsx scripts/audit-tool-content.ts --min=600
 */
import { TOOL_REGISTRY } from "../lib/tools/registry";
import { getToolGuide } from "../lib/tools/tool-guides";
import { toolFaq } from "../lib/tools/tools-seo";

const minArg = process.argv.find((a) => a.startsWith("--min="));
const MIN = minArg ? Number(minArg.split("=")[1]) : 600;

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

type Row = {
  slug: string;
  guide: number;
  examples: number;
  faq: number;
  total: number;
  sections: number;
  hasGuide: boolean;
};

const rows: Row[] = TOOL_REGISTRY.map((tool) => {
  const g = getToolGuide(tool.slug);
  const guide = g
    ? words(g.intro) +
      g.sections.reduce(
        (n, s) =>
          n +
          words(s.heading) +
          s.paragraphs.reduce((m, p) => m + words(p), 0) +
          (s.bullets ?? []).reduce((m, b) => m + words(b), 0),
        0
      )
    : 0;
  const examples = (g?.examples ?? []).reduce(
    (n, e) => n + words(e.title) + words(e.body),
    0
  );
  const faq = toolFaq(tool).reduce((n, f) => n + words(f.q) + words(f.a), 0);
  return {
    slug: tool.slug,
    guide,
    examples,
    faq,
    total: guide + examples + faq,
    sections: g?.sections.length ?? 0,
    hasGuide: !!g,
  };
}).sort((a, b) => a.total - b.total);

console.log(`\nTool content audit (target >= ${MIN} words)\n`);
console.log("slug".padEnd(26), "guide", "exmpl", " faq ", "total", "sec", "status");
for (const r of rows) {
  const status = !r.hasGuide ? "NO GUIDE" : r.total < MIN ? "THIN" : "ok";
  console.log(
    r.slug.padEnd(26),
    String(r.guide).padStart(5),
    String(r.examples).padStart(5),
    String(r.faq).padStart(5),
    String(r.total).padStart(5),
    String(r.sections).padStart(3),
    status
  );
}
const thin = rows.filter((r) => r.total < MIN);
console.log(
  `\n${rows.length} tools · ${thin.length} below ${MIN} words · ${
    rows.filter((r) => !r.hasGuide).length
  } without guide\n`
);
