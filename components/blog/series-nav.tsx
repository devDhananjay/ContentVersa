import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SeriesPart = {
  slug: string;
  title: string;
  part: number;
};

type Props = {
  seriesSlug: string;
  currentPart: number;
  parts: SeriesPart[];
};

export function SeriesNav({ seriesSlug, currentPart, parts }: Props) {
  const sorted = [...parts].sort((a, b) => a.part - b.part);
  if (sorted.length < 2) return null;

  return (
    <div className="rounded-2xl border bg-card/80 p-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-5 w-5 text-neon-purple" />
        <h2 className="font-display font-bold">Series: {seriesSlug.replace(/-/g, " ")}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}>
            <Badge
              variant={p.part === currentPart ? "gradient" : "outline"}
              className="cursor-pointer"
            >
              Part {p.part}
              {p.part === currentPart ? " · you are here" : ""}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
