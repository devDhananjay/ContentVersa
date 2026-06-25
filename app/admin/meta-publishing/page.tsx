import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetaPublishingPanel } from "@/components/admin/meta-publishing-panel";
import { isMetaAppConfigured } from "@/lib/meta/config";

export default function AdminMetaPublishingPage() {
  const appConfigured = isMetaAppConfigured();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Button>
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Share2 className="h-8 w-8 text-blue-500" />
          Meta Publishing
        </h1>
        <p className="text-muted-foreground mt-1">
          Publish blogs and reels to your Facebook Page and Instagram Business account
          using the Meta Graph API.
        </p>
      </div>

      {!appConfigured && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <strong>Optional:</strong> Set <code className="text-xs">META_APP_ID</code> and{" "}
          <code className="text-xs">META_APP_SECRET</code> for OAuth connect. You can also
          paste a Page access token in manual setup below.
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex justify-center py-16 text-muted-foreground">Loading…</div>
        }
      >
        <MetaPublishingPanel />
      </Suspense>
    </div>
  );
}
