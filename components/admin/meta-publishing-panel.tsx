"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Facebook,
  Instagram,
  Loader2,
  Plug,
  Send,
  Unplug,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { shouldSkipImageOptimization } from "@/lib/upload";
import { cn } from "@/lib/utils";

type IntegrationStatus = {
  connected: boolean;
  tokenPreview: string | null;
  pageId: string;
  pageName: string;
  igUserId: string | null;
  igUsername: string | null;
  connectedAt: string;
  source: "oauth" | "manual" | "env";
};

type PublishLog = {
  id: string;
  contentType: string;
  contentId: string;
  platform: string;
  externalId: string | null;
  permalink: string | null;
  status: string;
  error: string | null;
  createdAt: string;
};

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
};

type ReelItem = {
  id: string;
  caption: string;
  thumbnailUrl: string | null;
  mediaType: string;
  publishedAt: string | null;
};

const META_DEV_URL = "https://developers.facebook.com/apps/";

export function MetaPublishingPanel() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [appConfigured, setAppConfigured] = React.useState(false);
  const [integration, setIntegration] = React.useState<IntegrationStatus | null>(null);
  const [history, setHistory] = React.useState<PublishLog[]>([]);

  const [pageId, setPageId] = React.useState("");
  const [pageName, setPageName] = React.useState("");
  const [pageAccessToken, setPageAccessToken] = React.useState("");
  const [savingConfig, setSavingConfig] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);

  const [contentType, setContentType] = React.useState<"blog" | "reel">("blog");
  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState<(BlogItem | ReelItem)[]>([]);
  const [loadingContent, setLoadingContent] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [platforms, setPlatforms] = React.useState({ facebook: true, instagram: true });
  const [customMessage, setCustomMessage] = React.useState("");
  const [publishing, setPublishing] = React.useState(false);

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/meta/status", { credentials: "include" });
      const data = (await res.json()) as {
        appConfigured?: boolean;
        integration?: IntegrationStatus;
        history?: PublishLog[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load status");
      setAppConfigured(!!data.appConfigured);
      setIntegration(data.integration ?? null);
      setHistory(data.history ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load Meta status");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContent = React.useCallback(async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(
        `/api/admin/meta/content?type=${contentType}&q=${encodeURIComponent(search)}`,
        { credentials: "include" }
      );
      const data = (await res.json()) as { items?: (BlogItem | ReelItem)[] };
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoadingContent(false);
    }
  }, [contentType, search]);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  React.useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "1") toast.success("Meta account connected");
    if (error) toast.error(decodeURIComponent(error));
  }, [searchParams]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadContent(), 250);
    return () => window.clearTimeout(timer);
  }, [loadContent]);

  React.useEffect(() => {
    setSelectedId(null);
  }, [contentType]);

  const saveManualConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch("/api/admin/meta/status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          pageAccessToken,
          pageName: pageName || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; integration?: IntegrationStatus };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setIntegration(data.integration ?? null);
      setPageAccessToken("");
      toast.success("Meta Page connected");
      await loadStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save Meta config");
    } finally {
      setSavingConfig(false);
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/admin/meta/status", {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Disconnect failed");
      setIntegration(null);
      toast.success("Meta disconnected");
      await loadStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const publish = async () => {
    if (!selectedId) {
      toast.error("Select content to publish");
      return;
    }

    const selectedPlatforms = (["facebook", "instagram"] as const).filter((p) => platforms[p]);
    if (!selectedPlatforms.length) {
      toast.error("Select at least one platform");
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch("/api/admin/meta/publish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId: selectedId,
          platforms: selectedPlatforms,
          customMessage: customMessage.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        results?: { platform: string; success: boolean; permalink?: string; error?: string }[];
      };
      if (!res.ok && !data.results) throw new Error(data.error ?? "Publish failed");

      const results = data.results ?? [];
      const ok = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (ok.length) {
        toast.success(`Published to ${ok.map((r) => r.platform).join(" & ")}`);
      }
      for (const row of failed) {
        toast.error(`${row.platform}: ${row.error ?? "failed"}`);
      }

      await loadStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Plug className="h-5 w-5 text-blue-500" />
              Meta connection
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your Facebook Page and linked Instagram Business account to publish
              directly from ContentVerse.
            </p>
          </div>
          {integration?.connected ? (
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-500/30">
              <AlertCircle className="h-3 w-3 mr-1" /> Not connected
            </Badge>
          )}
        </div>

        {integration?.connected ? (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm space-y-2">
            <p>
              <span className="text-muted-foreground">Facebook Page:</span>{" "}
              <strong>{integration.pageName}</strong>{" "}
              <span className="text-xs text-muted-foreground">({integration.pageId})</span>
            </p>
            <p>
              <span className="text-muted-foreground">Instagram:</span>{" "}
              {integration.igUsername ? (
                <strong>@{integration.igUsername}</strong>
              ) : (
                <span className="text-amber-600">Not linked to this Page</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Token {integration.tokenPreview} · via {integration.source}
            </p>
            {integration.source !== "env" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() => void disconnect()}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Unplug className="h-3.5 w-3.5" />
                )}
                Disconnect
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appConfigured ? (
              <Button asChild className="gap-2">
                <Link href="/api/admin/meta/connect">
                  <Facebook className="h-4 w-4" /> Connect with Meta
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add <code className="text-xs">META_APP_ID</code> and{" "}
                <code className="text-xs">META_APP_SECRET</code> to enable OAuth, or paste a
                Page access token below.
              </p>
            )}

            <div className="rounded-xl border border-dashed border-border/60 p-4 space-y-3">
              <p className="text-sm font-medium">Manual setup (Page access token)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="meta-page-id">Facebook Page ID</Label>
                  <Input
                    id="meta-page-id"
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meta-page-name">Page name (optional)</Label>
                  <Input
                    id="meta-page-name"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="ContentVerse"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meta-page-token">Page access token</Label>
                <Input
                  id="meta-page-token"
                  type="password"
                  value={pageAccessToken}
                  onChange={(e) => setPageAccessToken(e.target.value)}
                  placeholder="EAA…"
                />
              </div>
              <Button
                onClick={() => void saveManualConfig()}
                disabled={savingConfig || !pageId.trim() || pageAccessToken.length < 10}
                className="gap-2"
              >
                {savingConfig ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plug className="h-4 w-4" />
                )}
                Save connection
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Requires a Meta Developer app with{" "}
          <code className="text-[10px]">pages_manage_posts</code> and{" "}
          <code className="text-[10px]">instagram_content_publish</code>.{" "}
          <a
            href={META_DEV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline inline-flex items-center gap-1"
          >
            Meta Developer Console <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </section>

      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Send className="h-5 w-5 text-orange-500" />
            Publish to Meta
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a published blog or reel and post it to Facebook and/or Instagram.
          </p>
        </div>

        {!integration?.connected && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            Connect Meta first to enable publishing.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(["blog", "reel"] as const).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={contentType === type ? "default" : "outline"}
              onClick={() => setContentType(type)}
            >
              {type === "blog" ? "Blogs" : "Reels"}
            </Button>
          ))}
        </div>

        <Input
          placeholder={`Search ${contentType === "blog" ? "blogs" : "reels"}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-2 max-h-64 overflow-y-auto rounded-xl border border-border/50 p-2">
          {loadingContent ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No published {contentType === "blog" ? "blogs" : "reels"} found
            </p>
          ) : (
            items.map((item) => {
              const isBlog = "title" in item;
              const id = item.id;
              const selected = selectedId === id;
              const thumb = isBlog ? item.coverImage : item.thumbnailUrl;
              const label = isBlog ? item.title : item.caption.slice(0, 80);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                    selected ? "bg-orange-500/15 ring-1 ring-orange-500/30" : "hover:bg-muted/40"
                  )}
                >
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0 relative">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={shouldSkipImageOptimization(thumb)}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString("en-IN")
                        : "—"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Custom caption (optional)</Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Override the default post message…"
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={platforms.facebook ? "default" : "outline"}
            className="gap-1.5"
            onClick={() => setPlatforms((p) => ({ ...p, facebook: !p.facebook }))}
          >
            <Facebook className="h-3.5 w-3.5" /> Facebook
          </Button>
          <Button
            type="button"
            size="sm"
            variant={platforms.instagram ? "default" : "outline"}
            className="gap-1.5"
            onClick={() => setPlatforms((p) => ({ ...p, instagram: !p.instagram }))}
            disabled={!integration?.igUserId}
            title={!integration?.igUserId ? "Instagram not linked" : undefined}
          >
            <Instagram className="h-3.5 w-3.5" /> Instagram
          </Button>
        </div>

        <Button
          variant="gradient"
          className="gap-2"
          onClick={() => void publish()}
          disabled={!integration?.connected || publishing || !selectedId}
        >
          {publishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Publish now
        </Button>
      </section>

      {history.length > 0 && (
        <section className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="font-display text-lg font-bold">Recent publishes</h2>
          <ul className="space-y-2 text-sm">
            {history.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 px-3 py-2"
              >
                <div>
                  <span className="font-medium capitalize">{row.platform.toLowerCase()}</span>
                  <span className="text-muted-foreground"> · {row.contentType}</span>
                  <span
                    className={cn(
                      "ml-2 text-xs",
                      row.status === "SUCCESS" ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {row.status}
                  </span>
                  {row.error && (
                    <p className="text-xs text-red-500 mt-0.5">{row.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString("en-IN")}
                  {row.permalink && (
                    <a
                      href={row.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline inline-flex items-center gap-1"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
