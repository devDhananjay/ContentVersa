import Link from "next/link";
import { ArrowLeft, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { P2SeoPanel } from "@/components/admin/p2-seo-panel";

export default function AdminSeoPage() {
  return (
    <div className="container py-8 max-w-5xl space-y-8">
      <div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Button>
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <LineChart className="h-8 w-8 text-emerald-500" />
          SEO pipeline (P2)
        </h1>
        <p className="text-muted-foreground mt-1">
          Curated topics and refresh queue — review before deploy, no mass auto-publish.
        </p>
      </div>

      <P2SeoPanel />
    </div>
  );
}
