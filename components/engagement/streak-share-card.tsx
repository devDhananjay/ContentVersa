"use client";

import * as React from "react";
import { Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAppUrl } from "@/lib/app-url";

const MILESTONES = [7, 14, 30] as const;

type Props = {
  streakDays: number;
  className?: string;
};

export function StreakShareCard({ streakDays, className }: Props) {
  const milestone = MILESTONES.filter((m) => streakDays >= m).pop();
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!milestone) return;
    const key = `cv-streak-share-${milestone}`;
    if (localStorage.getItem(key)) setDismissed(true);
  }, [milestone]);

  if (!milestone || dismissed) return null;

  const shareText = `${milestone}-day reading streak on ContentVerse 🔥`;
  const shareUrl = getAppUrl();
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const dismiss = () => {
    localStorage.setItem(`cv-streak-share-${milestone}`, "1");
    setDismissed(true);
  };

  return (
    <div
      className={`relative rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-card to-neon-pink/5 p-5 ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="text-xs uppercase tracking-widest text-orange-500 font-semibold">
        Milestone unlocked
      </p>
      <p className="font-display text-2xl font-extrabold mt-1">
        {milestone}-day streak
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Share your reading habit — inspire others on ContentVerse.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="gradient" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            WhatsApp
          </Button>
        </a>
        <a href={xUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            Share on X
          </Button>
        </a>
      </div>
    </div>
  );
}
