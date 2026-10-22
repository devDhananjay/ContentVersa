import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TelegramSharePanel,
  type TrendingNewsItem,
} from "@/components/admin/telegram-share-panel";
import { TelegramSetupWizard } from "@/components/admin/telegram-setup-wizard";
import { getTrendingHybrid } from "@/lib/data/blog-db";

export const dynamic = "force-dynamic";

export default async function AdminTelegramSharePage() {
  let news: TrendingNewsItem[] = [];
  try {
    const blogs = await getTrendingHybrid(12);
    news = blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      path: `/blog/${b.slug}`,
      views: typeof b.views === "number" ? b.views : undefined,
    }));
  } catch {
    news = [];
  }

  return (
    <div className="container py-8 max-w-5xl space-y-8">
      <div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Button>
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Send className="h-8 w-8 text-sky-500" />
          Telegram share desk
        </h1>
        <p className="text-muted-foreground mt-1">
          Top money / jobs / trending news — copy tip + interlinks, Telegram pe paste.
        </p>
      </div>

      <TelegramSetupWizard />
      <TelegramSharePanel news={news} />
    </div>
  );
}
