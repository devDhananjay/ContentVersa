"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  ChevronUp,
  Eye,
  Heart,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber, getInitials, cn } from "@/lib/utils";
import {
  REEL_DEFAULT_VIDEO_DURATION_SEC,
  REEL_IMAGE_DURATION_SEC,
  REEL_MAX_PLAY_DURATION_SEC,
} from "@/lib/reels/constants";
import type { ReelItem } from "@/lib/reels/types";
import { ReelCommentsPanel } from "@/components/reels/reel-comments-panel";

const VIEWER_HEIGHT = "calc(100dvh - var(--site-header-offset))";
const VIEWER_BG =
  "bg-gradient-to-b from-background via-neon-purple/10 to-neon-pink/10";
const SWIPE_THRESHOLD_PX = 48;

function getVisitorKey(): string {
  const key = "cv_reel_visitor";
  if (typeof window === "undefined") return "";
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}

async function recordView(reelId: string) {
  try {
    const res = await fetch(`/api/reels/${reelId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ visitorKey: getVisitorKey() }),
    });
    if (res.ok) {
      const { markReelViewedLocally } = await import("@/lib/reels/viewed-local");
      markReelViewedLocally(reelId);
    }
  } catch {
    /* best effort */
  }
}

function getPlayDurationSec(reel: ReelItem, videoDuration?: number) {
  if (reel.mediaType === "IMAGE") return REEL_IMAGE_DURATION_SEC;
  const fromMeta = reel.durationSec || videoDuration || REEL_DEFAULT_VIDEO_DURATION_SEC;
  return Math.min(Math.max(fromMeta, 3), REEL_MAX_PLAY_DURATION_SEC);
}

interface ReelsFeedViewerProps {
  initialReels: ReelItem[];
  startId?: string;
  immersive?: boolean;
}

export function ReelsFeedViewer({
  initialReels,
  startId,
  immersive = false,
}: ReelsFeedViewerProps) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [reels, setReels] = React.useState(initialReels);
  const [activeIndex, setActiveIndex] = React.useState(() => {
    if (!startId) return 0;
    const idx = initialReels.findIndex((r) => r.id === startId);
    return idx >= 0 ? idx : 0;
  });
  const [muted, setMuted] = React.useState(true);
  const [expandedCaption, setExpandedCaption] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [remainingSec, setRemainingSec] = React.useState(REEL_IMAGE_DURATION_SEC);
  const [likedByMe, setLikedByMe] = React.useState(false);
  const [likeBurst, setLikeBurst] = React.useState(false);
  const viewedRef = React.useRef(new Set<string>());
  const advancingRef = React.useRef(false);
  const pausedRef = React.useRef(false);
  const pointerStartRef = React.useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const wheelLockRef = React.useRef(false);
  const swipeZoneRef = React.useRef<HTMLDivElement>(null);
  const skipToNextRef = React.useRef<() => void>(() => {});
  const skipToPrevRef = React.useRef<() => void>(() => {});
  const [replayToken, setReplayToken] = React.useState(0);
  const [loading, setLoading] = React.useState(initialReels.length === 0);

  const closeOnComplete = Boolean(startId);
  const activeReel = reels[activeIndex];

  const closeViewer = React.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/blogs");
    }
  }, [router]);

  React.useEffect(() => {
    if (initialReels.length > 0) return;
    let cancelled = false;
    void fetch("/api/reels?limit=30", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { reels?: ReelItem[] }) => {
        if (cancelled || !data.reels?.length) return;
        setReels(data.reels);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialReels.length]);

  const paused = commentsOpen || expandedCaption;
  pausedRef.current = paused;

  const scrollToIndex = React.useCallback((index: number, smooth = true) => {
    const container = containerRef.current;
    if (!container) return;
    const top = index * container.clientHeight;
    container.scrollTo({
      top,
      behavior: smooth ? "smooth" : "auto",
    });
    setActiveIndex(index);
  }, []);

  const advanceToNext = React.useCallback(() => {
    if (advancingRef.current || pausedRef.current) return;
    advancingRef.current = true;
    const next = activeIndex + 1 >= reels.length ? 0 : activeIndex + 1;
    if (next === activeIndex) {
      setReplayToken((t) => t + 1);
    } else {
      scrollToIndex(next, true);
    }
    window.setTimeout(() => {
      advancingRef.current = false;
    }, 700);
  }, [activeIndex, reels.length, scrollToIndex]);

  const handleReelComplete = React.useCallback(() => {
    if (pausedRef.current) return;
    if (closeOnComplete) {
      closeViewer();
      return;
    }
    advanceToNext();
  }, [closeOnComplete, closeViewer, advanceToNext]);

  const onCompleteRef = React.useRef(handleReelComplete);
  onCompleteRef.current = handleReelComplete;

  React.useEffect(() => {
    setExpandedCaption(false);
    setCommentsOpen(false);
    setProgress(0);
    setRemainingSec(
      activeReel?.mediaType === "IMAGE"
        ? REEL_IMAGE_DURATION_SEC
        : activeReel?.durationSec ?? REEL_DEFAULT_VIDEO_DURATION_SEC
    );
  }, [activeIndex, replayToken, activeReel?.mediaType, activeReel?.durationSec]);

  React.useEffect(() => {
    if (!startId) return;
    const idx = reels.findIndex((r) => r.id === startId);
    if (idx >= 0) scrollToIndex(idx, false);
  }, [startId, reels, scrollToIndex]);

  React.useEffect(() => {
    const reel = reels[activeIndex];
    if (!reel || viewedRef.current.has(reel.id)) return;
    viewedRef.current.add(reel.id);
    void recordView(reel.id);
  }, [activeIndex, reels]);

  React.useEffect(() => {
    if (!activeReel) return;
    void fetch(`/api/reels/${activeReel.id}/like`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { likedByMe?: boolean; likesCount?: number }) => {
        setLikedByMe(Boolean(d.likedByMe));
        if (typeof d.likesCount === "number") {
          setReels((prev) =>
            prev.map((r) =>
              r.id === activeReel.id ? { ...r, likesCount: d.likesCount! } : r
            )
          );
        }
      })
      .catch(() => {});
  }, [activeReel?.id]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: [0.6] }
    );

    container.querySelectorAll("[data-reel-card]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reels]);

  const skipToNext = React.useCallback(() => {
    if (commentsOpen || advancingRef.current) return;
    advancingRef.current = true;

    const next = activeIndex + 1;
    if (next >= reels.length) {
      if (closeOnComplete) closeViewer();
      else scrollToIndex(0, true);
    } else {
      scrollToIndex(next, true);
    }

    window.setTimeout(() => {
      advancingRef.current = false;
    }, 500);
  }, [activeIndex, reels.length, closeOnComplete, closeViewer, scrollToIndex, commentsOpen]);

  const skipToPrev = React.useCallback(() => {
    if (commentsOpen || advancingRef.current || activeIndex <= 0) return;
    advancingRef.current = true;
    scrollToIndex(activeIndex - 1, true);
    window.setTimeout(() => {
      advancingRef.current = false;
    }, 500);
  }, [activeIndex, scrollToIndex, commentsOpen]);

  skipToNextRef.current = skipToNext;
  skipToPrevRef.current = skipToPrev;

  React.useEffect(() => {
    const zone = swipeZoneRef.current;
    if (!zone) return;

    const onWheel = (e: WheelEvent) => {
      if (commentsOpen || wheelLockRef.current) return;
      if (Math.abs(e.deltaY) < 28) return;
      e.preventDefault();
      wheelLockRef.current = true;
      if (e.deltaY > 0) skipToNextRef.current();
      else skipToPrevRef.current();
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    };

    zone.addEventListener("wheel", onWheel, { passive: false });
    return () => zone.removeEventListener("wheel", onWheel);
  }, [commentsOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (commentsOpen || e.button !== 0) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    pointerStartRef.current = null;

    if (commentsOpen) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dy) < SWIPE_THRESHOLD_PX || Math.abs(dy) < Math.abs(dx) * 1.1) return;

    if (dy < 0) skipToNextRef.current();
    else skipToPrevRef.current();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current?.pointerId === e.pointerId) {
      pointerStartRef.current = null;
    }
  };

  const updateReelMeta = (id: string, patch: Partial<ReelItem>) => {
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const toggleLike = async () => {
    if (!activeReel) return;
    const wasLiked = likedByMe;
    const nextLiked = !wasLiked;
    const prevCount = activeReel.likesCount ?? 0;

    setLikedByMe(nextLiked);
    updateReelMeta(activeReel.id, {
      likesCount: nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1),
    });
    setLikeBurst(nextLiked);
    setTimeout(() => setLikeBurst(false), 500);

    try {
      const res = await fetch(`/api/reels/${activeReel.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        likedByMe?: boolean;
        likesCount?: number;
      };
      if (res.status === 401) {
        toast.message("Sign in to save your like", {
          action: {
            label: "Sign in",
            onClick: () => router.push(`/auth/sign-in?next=/reels/${activeReel.id}`),
          },
        });
        return;
      }
      if (res.ok) {
        setLikedByMe(Boolean(data.likedByMe));
        if (typeof data.likesCount === "number") {
          updateReelMeta(activeReel.id, { likesCount: data.likesCount });
        }
      } else {
        setLikedByMe(wasLiked);
        updateReelMeta(activeReel.id, { likesCount: prevCount });
      }
    } catch {
      setLikedByMe(wasLiked);
      updateReelMeta(activeReel.id, { likesCount: prevCount });
    }
  };

  const shareReel = async () => {
    if (!activeReel) return;
    const url = `${window.location.origin}/reels/${activeReel.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${activeReel.author.name} on ContentVerse`,
          text: activeReel.caption.slice(0, 120),
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Reel link copied!");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error("Could not share reel");
    }
  };

  if (loading) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center gap-3 px-6 text-center", VIEWER_BG)}
        style={{ height: VIEWER_HEIGHT, minHeight: VIEWER_HEIGHT }}
      >
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-neon-pink animate-spin" />
        <p className="text-sm text-muted-foreground">Loading reels…</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center gap-4 px-6 text-center", VIEWER_BG)}
        style={{ height: VIEWER_HEIGHT, minHeight: VIEWER_HEIGHT }}
      >
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
          <Heart className="h-9 w-9 text-white" />
        </div>
        <div>
          <p className="font-display text-xl font-bold">No reels yet</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to share something!</p>
        </div>
        <Link
          href="/dashboard/reels/create"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple text-white text-sm font-semibold shadow-lg"
        >
          Create a reel
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn("relative w-full overflow-hidden flex-1", VIEWER_BG)}
      style={{ height: VIEWER_HEIGHT, minHeight: VIEWER_HEIGHT }}
    >
      {(immersive || startId) && (
        <button
          type="button"
          onClick={closeViewer}
          aria-label="Close reel"
          className="absolute top-3 left-3 z-[60] h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="relative h-full max-w-md mx-auto flex flex-col">
        <div className="relative flex-1 min-h-0 md:px-2">
          <div
            className="relative h-full md:rounded-2xl md:overflow-hidden md:border md:border-white/10 md:shadow-2xl"
            style={{ minHeight: VIEWER_HEIGHT }}
          >
            {activeReel && (
              <div className="absolute top-0 inset-x-0 z-30 px-3 pt-3 pointer-events-none">
                <div className="h-[3px] rounded-full bg-white/25 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-semibold text-white/90 tabular-nums bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {remainingSec}s left
                  </span>
                  <span className="text-[11px] text-white/70 tabular-nums bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {activeIndex + 1} / {reels.length}
                  </span>
                </div>
              </div>
            )}

            <div
              ref={containerRef}
              className="overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-y-contain"
              style={{ height: VIEWER_HEIGHT, minHeight: VIEWER_HEIGHT }}
            >
              {reels.map((reel, index) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  index={index}
                  isActive={index === activeIndex}
                  replayToken={index === activeIndex ? replayToken : 0}
                  muted={muted}
                  paused={paused && index === activeIndex}
                  expandedCaption={expandedCaption && index === activeIndex}
                  onToggleCaption={() => setExpandedCaption((v) => !v)}
                  onProgress={(p, remaining) => {
                    if (index !== activeIndex) return;
                    setProgress(p);
                    setRemainingSec(remaining);
                  }}
                  onComplete={() => {
                    if (index === activeIndex) onCompleteRef.current();
                  }}
                />
              ))}
            </div>

            {/* Swipe zone: video area only — keeps caption + side actions tappable */}
            {!commentsOpen && (
              <div
                ref={swipeZoneRef}
                className="absolute inset-x-0 top-14 bottom-32 right-16 z-[25] touch-none cursor-grab active:cursor-grabbing"
                aria-hidden
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              />
            )}

            <AnimatePresence>
              {likeBurst && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                >
                  <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>

            {activeReel && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 pointer-events-auto"
              >
                <ActionButton
                  icon={
                    <Heart
                      className={cn("h-6 w-6", likedByMe && "fill-red-500 text-red-500")}
                    />
                  }
                  label={likedByMe ? "Liked" : formatNumber(activeReel.likesCount ?? 0)}
                  active={likedByMe}
                  onClick={() => void toggleLike()}
                />
                <ActionButton
                  icon={<MessageCircle className="h-6 w-6" />}
                  label={formatNumber(activeReel.commentsCount ?? 0)}
                  onClick={() => setCommentsOpen(true)}
                />
                <ActionButton
                  icon={<Send className="h-5 w-5" />}
                  label="Share"
                  onClick={() => void shareReel()}
                />
                <ActionButton
                  icon={muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  label=""
                  onClick={() => setMuted((m) => !m)}
                />
                <ActionButton
                  icon={<Eye className="h-5 w-5" />}
                  label={formatNumber(activeReel.views ?? 0)}
                  small
                />
              </motion.div>
            )}

            {activeIndex > 0 && !commentsOpen && (
              <button
                type="button"
                onClick={() => skipToPrev()}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white"
              >
                <ChevronUp className="h-6 w-6 animate-bounce" />
              </button>
            )}

            {activeIndex < reels.length - 1 && !commentsOpen && (
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-[10px] text-white/40 tracking-wide">
                Swipe up for next
              </p>
            )}

            {activeReel && (
              <ReelCommentsPanel
                reelId={activeReel.id}
                open={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                initialCount={activeReel.commentsCount ?? 0}
                onCountChange={(count) =>
                  updateReelMeta(activeReel.id, { commentsCount: count })
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  small,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  small?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-white group"
    >
      <div
        className={cn(
          "h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all group-hover:scale-105 group-active:scale-95",
          active
            ? "bg-red-500/35 border-red-400/60 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
            : "bg-white/10 border-white/10 group-hover:bg-white/20"
        )}
      >
        {icon}
      </div>
      {label ? (
        <span
          className={cn(
            "font-semibold",
            small ? "text-[10px]" : "text-xs",
            active ? "text-red-300" : "text-white/90"
          )}
        >
          {label}
        </span>
      ) : null}
    </button>
  );
}

function ReelCard({
  reel,
  index,
  isActive,
  replayToken,
  muted,
  paused,
  expandedCaption,
  onToggleCaption,
  onProgress,
  onComplete,
}: {
  reel: ReelItem;
  index: number;
  isActive: boolean;
  replayToken: number;
  muted: boolean;
  paused: boolean;
  expandedCaption: boolean;
  onToggleCaption: () => void;
  onProgress: (progressPct: number, remainingSec: number) => void;
  onComplete: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const durationRef = React.useRef(REEL_IMAGE_DURATION_SEC);
  const completedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = React.useRef(onComplete);
  const onProgressRef = React.useRef(onProgress);
  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => {
    if (!isActive) {
      completedRef.current = false;
      clearTimer();
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
      return;
    }

    completedRef.current = false;
    clearTimer();

    if (reel.mediaType === "VIDEO") {
      const v = videoRef.current;
      if (!v) return;

      const startPlayback = () => {
        durationRef.current = getPlayDurationSec(reel, v.duration || undefined);
        if (!paused) void v.play().catch(() => {});
      };

      v.addEventListener("loadedmetadata", startPlayback);
      if (v.readyState >= 1) startPlayback();

      const onTimeUpdate = () => {
        if (paused || completedRef.current) return;
        const dur = durationRef.current;
        const pct = Math.min(100, (v.currentTime / dur) * 100);
        const rem = Math.max(0, Math.ceil(dur - v.currentTime));
        onProgressRef.current(pct, rem);
        if (v.currentTime >= dur - 0.2) {
          completedRef.current = true;
          v.pause();
          onCompleteRef.current();
        }
      };

      const onEnded = () => {
        if (completedRef.current) return;
        completedRef.current = true;
        onCompleteRef.current();
      };

      v.addEventListener("timeupdate", onTimeUpdate);
      v.addEventListener("ended", onEnded);

      return () => {
        v.removeEventListener("loadedmetadata", startPlayback);
        v.removeEventListener("timeupdate", onTimeUpdate);
        v.removeEventListener("ended", onEnded);
        v.pause();
      };
    }

    durationRef.current = getPlayDurationSec(reel);
    const durMs = durationRef.current * 1000;
    const startedAt = Date.now();
    let pausedAccum = 0;
    let pauseStarted = 0;

    timerRef.current = setInterval(() => {
      if (paused) {
        if (!pauseStarted) pauseStarted = Date.now();
        return;
      }
      if (pauseStarted) {
        pausedAccum += Date.now() - pauseStarted;
        pauseStarted = 0;
      }
      const elapsed = Date.now() - startedAt - pausedAccum;
      const pct = Math.min(100, (elapsed / durMs) * 100);
      const rem = Math.max(0, Math.ceil((durMs - elapsed) / 1000));
      onProgressRef.current(pct, rem);

      if (elapsed >= durMs && !completedRef.current) {
        completedRef.current = true;
        clearTimer();
        onCompleteRef.current();
      }
    }, 50);

    return clearTimer;
  }, [isActive, paused, replayToken, reel.id, reel.mediaType, reel.durationSec]);

  React.useEffect(() => {
    if (!isActive || reel.mediaType !== "VIDEO") return;
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else void v.play().catch(() => {});
  }, [paused, isActive, reel.mediaType]);

  return (
    <div
      data-reel-card
      data-reel-id={reel.id}
      data-index={index}
      className="relative w-full snap-start snap-always shrink-0 bg-black"
      style={{ height: VIEWER_HEIGHT, minHeight: VIEWER_HEIGHT }}
    >
      {reel.mediaType === "VIDEO" ? (
        <video
          ref={videoRef}
          src={reel.mediaUrl}
          poster={reel.thumbnailUrl || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted={muted}
          preload="auto"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={reel.mediaUrl}
          alt={reel.caption}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pr-16 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <Avatar className="h-9 w-9 ring-2 ring-white/30">
            {reel.author.image ? (
              <AvatarImage src={reel.author.image} alt={reel.author.name} />
            ) : null}
            <AvatarFallback className="text-xs bg-gradient-to-br from-neon-pink to-neon-purple text-white">
              {getInitials(reel.author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate flex items-center gap-1">
              <span>@{reel.author.username}</span>
              {reel.author.isVerified && (
                <BadgeCheck className="h-4 w-4 text-neon-cyan shrink-0" aria-label="Verified" />
              )}
            </p>
          </div>
        </div>

        <button type="button" onClick={onToggleCaption} className="text-left w-full">
          <p className={`text-sm text-white leading-relaxed ${expandedCaption ? "" : "line-clamp-2"}`}>
            {reel.caption}
          </p>
          {reel.caption.length > 80 && !expandedCaption && (
            <span className="text-xs text-white/50">more</span>
          )}
        </button>

        {reel.relatedBlog ? (
          <Link
            href={`/blog/${reel.relatedBlog.slug}`}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Read: {reel.relatedBlog.title}
          </Link>
        ) : null}

        <div className="flex items-center gap-3 mt-2 text-[11px] text-white/70">
          <span>{formatNumber(reel.views ?? 0)} views</span>
          <span>{formatNumber(reel.likesCount ?? 0)} likes</span>
          <span>{formatNumber(reel.commentsCount ?? 0)} comments</span>
        </div>
      </div>
    </div>
  );
}
