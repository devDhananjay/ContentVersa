"use client";

import * as React from "react";
import Image from "next/image";
import {
  Clapperboard,
  Code,
  Cpu,
  Gamepad2,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  technology: Cpu,
  ai: Sparkles,
  programming: Code,
  movies: Clapperboard,
  gaming: Gamepad2,
  startups: Rocket,
  finance: TrendingUp,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  technology: "from-blue-500/30 to-cyan-500/20",
  ai: "from-violet-500/30 to-fuchsia-500/20",
  programming: "from-emerald-500/30 to-teal-500/20",
  movies: "from-red-500/30 to-rose-500/20",
  gaming: "from-purple-500/30 to-indigo-500/20",
  startups: "from-pink-500/30 to-rose-500/20",
  finance: "from-emerald-500/30 to-teal-500/20",
};

interface FeedItemImageProps {
  image?: string;
  title: string;
  category?: string;
  className?: string;
  iconClassName?: string;
  sizes?: string;
  priority?: boolean;
}

export function FeedItemImage({
  image,
  title,
  category,
  className,
  iconClassName,
  sizes = "200px",
  priority = false,
}: FeedItemImageProps) {
  const [failed, setFailed] = React.useState(false);
  const Icon = (category && CATEGORY_ICONS[category]) || Cpu;
  const gradient =
    (category && CATEGORY_GRADIENTS[category]) ||
    "from-neon-blue/30 to-neon-purple/20";

  if (image && !failed) {
    return (
      <Image
        src={image}
        alt={title}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <Icon className={cn("h-8 w-8 text-foreground/50", iconClassName)} />
    </div>
  );
}
