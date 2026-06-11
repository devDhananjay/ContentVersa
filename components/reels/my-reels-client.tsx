"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Film, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReelsLibraryStrip } from "@/components/reels/reels-library-strip";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { ReelDashboardRow } from "@/lib/reels/types";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
  REJECTED: "destructive",
};

const TABS = [
  { value: "all", label: "All" },
  { value: "PUBLISHED", label: "Live" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
] as const;

function ReelRow({
  reel,
  onDeleted,
}: {
  reel: ReelDashboardRow;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const thumb = reel.thumbnailUrl || reel.mediaUrl;

  const deleteReel = async () => {
    const ok = window.confirm(`Delete this reel? This cannot be undone.`);
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/reels/mine/${encodeURIComponent(reel.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed");
      onDeleted(reel.id);
      toast.success("Reel deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete reel");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-neon-pink/40 transition-colors">
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {reel.mediaType === "VIDEO" ? (
          <video
            src={reel.mediaUrl}
            poster={thumb}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={STATUS_VARIANTS[reel.status] ?? "secondary"}>{reel.status}</Badge>
          <span className="text-xs text-muted-foreground">{timeAgo(reel.createdAt)}</span>
        </div>
        <p className="font-medium line-clamp-2 mt-1 text-sm">{reel.caption}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatNumber(reel.views)} views · {formatNumber(reel.likesCount)} likes
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {reel.status === "PUBLISHED" && (
          <Button variant="ghost" size="icon" aria-label="View reel" asChild>
            <Link href={`/reels/${reel.id}`} target="_blank">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" aria-label="Edit reel" asChild>
          <Link href={`/dashboard/reels/${reel.id}/edit`}>
            <Edit3 className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete reel"
          disabled={deleting}
          onClick={deleteReel}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function MyReelsClient({ initialRows }: { initialRows: ReelDashboardRow[] }) {
  const [rows, setRows] = React.useState(initialRows);
  const [tab, setTab] = React.useState<string>("all");

  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const filtered =
    tab === "all" ? rows : rows.filter((r) => r.status === tab);

  return (
    <div className="space-y-8">
      <ReelsLibraryStrip reels={rows} title="Your library" />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Film className="h-4 w-4 text-neon-pink" />
          <h2 className="font-display text-lg font-bold">Manage reels</h2>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                {t.value !== "all" && (
                  <span className="ml-1.5 text-muted-foreground">
                    ({rows.filter((r) => r.status === t.value).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
                No reels in this tab.
              </div>
            ) : (
              filtered.map((reel) => (
                <ReelRow key={reel.id} reel={reel} onDeleted={(id) => setRows((prev) => prev.filter((r) => r.id !== id))} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
