import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiArticleGenerator } from "@/components/admin/ai-article-generator";
import { AiPublishingPipeline } from "@/components/admin/ai-publishing-pipeline";
import { isGeminiConfigured } from "@/lib/ai/gemini";

export default function AdminAiArticlesPage() {
  const geminiOk = isGeminiConfigured();

  return (
    <div className="container py-8 max-w-4xl space-y-12">
      <div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Button>
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-orange-500" />
          AI articles
        </h1>
        <p className="text-muted-foreground mt-1">
          Multi-agent publishing pipeline plus classic one-click topic drafts.
        </p>
      </div>

      {!geminiOk && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <strong>GEMINI_API_KEY</strong> is not set on the server. Add it to{" "}
          <code className="text-xs">.env</code> and restart the app.
        </div>
      )}

      <AiPublishingPipeline />

      <div className="border-t pt-10">
        <h2 className="font-display text-2xl font-bold mb-2">Classic hot topics</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Quick generate from category topics (single-step, same as before).
        </p>
        <AiArticleGenerator />
      </div>
    </div>
  );
}
