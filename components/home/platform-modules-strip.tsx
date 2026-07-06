"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Medal,
  TrendingUp,
  Briefcase,
  Film,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Inbox,
  BarChart3,
  Users2,
  Settings,
  Check,
  Activity,
  Lock,
  PenLine,
  CalendarClock,
  Mail,
  BadgeCheck,
  PenSquare,
  Clapperboard,
  Gem,
  Wallet,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/home/motion";
import { cn } from "@/lib/utils";

type Hub = {
  name: string;
  path: string;
  tagline: string;
  description: string;
  badge: string;
  features: string[];
  metric: string;
  metricLabel: string;
  icon: LucideIcon;
  color: string;
  glow: string;
};

const CORE_HUBS: Hub[] = [
  {
    name: "Blogs",
    path: "/blogs",
    tagline: "Long-form that lasts",
    description: "Essays, tutorials & opinion from Indian creators — depth over scroll-bait.",
    badge: "Core",
    features: ["Quality bar", "Tips in ₹", "AI summary"],
    metric: "800+",
    metricLabel: "word bar",
    icon: Compass,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.5)",
  },
  {
    name: "Sports",
    path: "/sports",
    tagline: "Match-day ready",
    description: "Live cricket scores, fixtures & sports editorial in one hub.",
    badge: "Live",
    features: ["Live scores", "Fixtures", "Sports blogs"],
    metric: "24/7",
    metricLabel: "scores",
    icon: Medal,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.5)",
  },
  {
    name: "Finance",
    path: "/finance",
    tagline: "Markets + meaning",
    description: "Nifty, Sensex & movers — plus finance explainers you can trust.",
    badge: "Live",
    features: ["Nifty / Sensex", "Movers", "Explainers"],
    metric: "NSE",
    metricLabel: "markets",
    icon: TrendingUp,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.5)",
  },
  {
    name: "Jobs",
    path: "/jobs",
    tagline: "Careers, India-first",
    description: "Sarkari & private openings next to career guides that help you apply smarter.",
    badge: "Utility",
    features: ["Govt jobs", "Private roles", "Guides"],
    metric: "IN",
    metricLabel: "careers",
    icon: Briefcase,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.5)",
  },
  {
    name: "Reels",
    path: "/reels",
    tagline: "Discover, then read",
    description: "Short clips from creators — find a voice, then dive into their full articles.",
    badge: "Social",
    features: ["Short video", "Creators", "Trending"],
    metric: "HD",
    metricLabel: "shorts",
    icon: Film,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.5)",
  },
];

const VERSE_HUBS: Hub[] = [
  {
    name: "CineVerse",
    path: "/cineverse",
    tagline: "Movies & OTT India",
    description: "Discover films, build your watchlist and get AI picks — TMDB-powered for Indian audiences.",
    badge: "Verse",
    features: ["TMDB search", "Watchlist", "AI picks"],
    metric: "OTT",
    metricLabel: "movies",
    icon: Clapperboard,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.5)",
  },
  {
    name: "GoldVerse",
    path: "/goldverse",
    tagline: "Gold rates & HUID",
    description: "Live gold prices across Indian cities, BIS hallmark tools and free HUID verification.",
    badge: "Verse",
    features: ["316+ cities", "HUID verify", "Hallmark guide"],
    metric: "BIS",
    metricLabel: "hallmark",
    icon: Gem,
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.5)",
  },
  {
    name: "MoneyVerse",
    path: "/moneyverse",
    tagline: "UPI expense tracker",
    description: "Track spending, plan budgets, set SIP reminders — plus Screenshot Scan (OCR) for UPI payments.",
    badge: "Verse",
    features: ["Screenshot OCR", "Budgets", "SIP reminders"],
    metric: "OCR",
    metricLabel: "UPI scan",
    icon: Wallet,
    color: "#34d399",
    glow: "rgba(52,211,153,0.5)",
  },
];

const ALL_HUBS: Hub[] = [...CORE_HUBS, ...VERSE_HUBS];

/** Extra OCR card links to dedicated SEO page */
const MONEYVERSE_OCR = {
  name: "Screenshot OCR",
  path: "/moneyverse/screenshot-scan",
  tagline: "UPI → expense auto-fill",
  features: ["PhonePe / GPay", "Amount extract", "Save expense"],
  icon: ScanLine,
  color: "#8b5cf6",
};

type FlowTool = {
  name: string;
  path: string;
  tagline: string;
  status: string;
  icon: LucideIcon;
  color: string;
  badge: string;
};

/** Creator pipeline — write → schedule → newsletter → approval */
const CREATOR_TOOLS: FlowTool[] = [
  {
    name: "Create blogs",
    path: "/dashboard/create",
    tagline: "Write & publish your story",
    status: "Studio",
    icon: PenLine,
    color: "#14b8a6",
    badge: "Creator",
  },
  {
    name: "Blog scheduling",
    path: "/dashboard/blogs",
    tagline: "Pick a go-live time",
    status: "Cron",
    icon: CalendarClock,
    color: "#2dd4bf",
    badge: "Creator",
  },
  {
    name: "Newsletter",
    path: "/#newsletter",
    tagline: "Weekly reads, opt-in only",
    status: "Opt-in",
    icon: Mail,
    color: "#06b6d4",
    badge: "Reach",
  },
  {
    name: "Blog approval",
    path: "/admin/moderation",
    tagline: "Review & publish queue",
    status: "Queue",
    icon: BadgeCheck,
    color: "#22d3ee",
    badge: "Staff",
  },
];

const ADMIN_TOOLS: FlowTool[] = [
  {
    name: "Blog approval",
    path: "/admin/moderation",
    tagline: "Approve pending blogs",
    status: "Queue",
    icon: Inbox,
    color: "#f97316",
    badge: "Staff",
  },
  {
    name: "AI articles",
    path: "/admin/ai-articles",
    tagline: "Hot topics → publish",
    status: "Pipeline",
    icon: Sparkles,
    color: "#fb923c",
    badge: "Staff",
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    tagline: "Platform pulse",
    status: "Live",
    icon: BarChart3,
    color: "#fdba74",
    badge: "Staff",
  },
  {
    name: "Users",
    path: "/admin/users",
    tagline: "Accounts & roles",
    status: "Roles",
    icon: Users2,
    color: "#ea580c",
    badge: "Staff",
  },
  {
    name: "Settings",
    path: "/admin/settings",
    tagline: "CMS & branding",
    status: "CMS",
    icon: Settings,
    color: "#c2410c",
    badge: "Staff",
  },
];

/** Explicit arrowhead — never relies on marker orient (avoids flipped arrows). */
function ArrowHead({
  x,
  y,
  dir,
  color,
  size = 7,
}: {
  x: number;
  y: number;
  dir: "right" | "down" | "left" | "up";
  color: string;
  size?: number;
}) {
  const s = size;
  const points =
    dir === "right"
      ? `${x},${y - s / 2} ${x + s},${y} ${x},${y + s / 2}`
      : dir === "down"
        ? `${x - s / 2},${y} ${x},${y + s} ${x + s / 2},${y}`
        : dir === "left"
          ? `${x},${y - s / 2} ${x - s},${y} ${x},${y + s / 2}`
          : `${x - s / 2},${y} ${x},${y - s} ${x + s / 2},${y}`;
  return <polygon points={points} fill={color} />;
}

function StartNode({
  cx,
  cy,
  color,
}: {
  cx: number;
  cy: number;
  color: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="6" fill={`${color}33`} />
      <circle cx={cx} cy={cy} r="4.5" fill="none" stroke={color} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="1.8" fill={color} />
    </g>
  );
}

/**
 * Orthogonal stepped connector — open circle → 90° jog → arrow (always L→R).
 */
function StepConnector({
  color,
  jog = "up",
  label,
  className,
}: {
  color: string;
  jog?: "up" | "down";
  label?: string;
  className?: string;
}) {
  const d = jog === "up" ? "M10 54 H22 V18 H42" : "M10 26 H22 V62 H42";
  const startY = jog === "up" ? 54 : 26;
  const endY = jog === "up" ? 18 : 62;
  const labelY = jog === "up" ? 34 : 46;

  return (
    <div
      className={cn(
        "pointer-events-none relative z-20 flex w-9 shrink-0 flex-col items-center justify-center self-center sm:w-11 md:w-12 xl:w-14",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 56 80" className="h-[4.5rem] w-full overflow-visible md:h-20">
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.22"
        />
        <StartNode cx={10} cy={startY} color={color} />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 6"
          className="journey-path"
        />
        {/* Tip sits just before arrow base */}
        <ArrowHead x={42} y={endY} dir="right" color={color} size={8} />
        {label ? (
          <text
            x="28"
            y={labelY}
            textAnchor="middle"
            fill={color}
            fontSize="7"
            fontWeight="700"
            opacity="0.85"
          >
            {label}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

/** Vertical drop between layers (always points down). */
function DropConnector({
  from = "#ec4899",
  to = "#f97316",
  label = "sync",
  id = "drop",
}: {
  from?: string;
  to?: string;
  label?: string;
  id?: string;
}) {
  return (
    <div className="pointer-events-none relative z-20 flex flex-col items-center py-0.5" aria-hidden>
      <svg viewBox="0 0 48 76" className="h-[4.25rem] w-12 overflow-visible">
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <path
          d="M24 10 V30 H34 V58"
          fill="none"
          stroke={`url(#${id}-grad)`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.22"
        />
        <StartNode cx={24} cy={10} color={from} />
        <path
          d="M24 10 V30 H34 V58"
          fill="none"
          stroke={`url(#${id}-grad)`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 6"
          className="journey-path"
        />
        <ArrowHead x={34} y={58} dir="down" color={to} size={8} />
        <text x="40" y="42" fill={to} fontSize="7" fontWeight="700" opacity="0.8">
          {label}
        </text>
      </svg>
    </div>
  );
}

/** Collector under public cards → center stem down. */
function CollectorRail({ hubColors }: { hubColors: string[] }) {
  const xs = Array.from({ length: hubColors.length }, (_, i) =>
    Math.round(((i + 0.5) / hubColors.length) * 1000)
  );

  return (
    <div className="pointer-events-none relative z-0 -mt-0.5 hidden h-16 w-full lg:block" aria-hidden>
      <svg viewBox="0 0 1000 64" className="h-full w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        {xs.map((x, i) => (
          <g key={x}>
            <path
              d={`M${x} 4 V30`}
              fill="none"
              stroke={hubColors[i]}
              strokeWidth="2.2"
              strokeDasharray="4 6"
              strokeLinecap="round"
              className="journey-path"
            />
            <circle cx={x} cy="4" r="3.5" fill="none" stroke={hubColors[i]} strokeWidth="1.6" />
            <circle cx={x} cy="4" r="1.4" fill={hubColors[i]} />
          </g>
        ))}
        <path
          d={`M${xs[0]} 30 H${xs[xs.length - 1]}`}
          fill="none"
          stroke="url(#spine-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 6"
          className="journey-path"
        />
        <circle cx="500" cy="34" r="7" fill="#f9731633" />
        <circle cx="500" cy="34" r="4" fill="#f97316" />
        <path
          d="M500 38 V54"
          fill="none"
          stroke="#f97316"
          strokeWidth="2.4"
          strokeDasharray="4 6"
          strokeLinecap="round"
          className="journey-path"
        />
        <ArrowHead x={500} y={54} dir="down" color="#f97316" size={8} />
      </svg>
    </div>
  );
}

/** Fan-out from layer badge into cards — arrows always point down. */
function FanRail({
  columns,
  color = "#f97316",
}: {
  columns: number;
  color?: string;
}) {
  const xs = Array.from({ length: columns }, (_, i) =>
    Math.round(((i + 0.5) / columns) * 1000)
  );
  return (
    <div className="pointer-events-none relative z-0 -mb-0.5 hidden h-14 w-full lg:block" aria-hidden>
      <svg viewBox="0 0 1000 56" className="h-full w-full overflow-visible" preserveAspectRatio="none">
        <circle cx="500" cy="6" r="5" fill={color} opacity="0.35" />
        <circle cx="500" cy="6" r="3" fill={color} />
        {xs.map((x) => (
          <g key={x}>
            <path
              d={`M500 10 V20 H${x} V42`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 6"
              className="journey-path"
              opacity="0.9"
            />
            <ArrowHead x={x} y={42} dir="down" color={color} size={7} />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Scan-corner brackets like the verification UI references. */
function ScanCorners({ color }: { color: string }) {
  return (
    <span className="pointer-events-none absolute inset-1.5 opacity-40 transition group-hover:opacity-80" aria-hidden>
      <span
        className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 rounded-tl-sm"
        style={{ borderColor: color }}
      />
      <span
        className="absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 rounded-tr-sm"
        style={{ borderColor: color }}
      />
      <span
        className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 rounded-bl-sm"
        style={{ borderColor: color }}
      />
      <span
        className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 rounded-br-sm"
        style={{ borderColor: color }}
      />
    </span>
  );
}

function HubCard({
  hub,
  index,
  reduce,
  className,
}: {
  hub: Hub;
  index: number;
  reduce: boolean | null;
  className?: string;
}) {
  const Icon = hub.icon;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        reduce
          ? undefined
          : { y: -8, transition: { type: "spring", stiffness: 400, damping: 18 } }
      }
      className={cn("relative z-10 min-w-0 flex-1", className)}
    >
      <Link
        href={hub.path}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/95 p-4 shadow-xl backdrop-blur-xl md:p-5"
        style={{
          boxShadow: `0 0 0 1px ${hub.color}28, 0 14px 36px -10px ${hub.glow}`,
        }}
      >
        <ScanCorners color={hub.color} />
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${hub.color}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl transition group-hover:opacity-75"
          style={{ background: hub.color }}
        />

        <div className="relative flex items-start justify-between gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/10 transition group-hover:scale-110 group-hover:rotate-3 md:h-11 md:w-11"
            style={{
              background: `linear-gradient(135deg, ${hub.color}44, ${hub.color}11)`,
              color: hub.color,
            }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-foreground/80">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{
                color: hub.color,
                borderColor: `${hub.color}55`,
                background: `${hub.color}18`,
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                  style={{ background: hub.color }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: hub.color }}
                />
              </span>
              {hub.badge}
            </span>
          </div>
        </div>

        <h3 className="relative mt-3 font-display text-base font-extrabold tracking-tight md:text-lg xl:text-xl">
          {hub.name}
        </h3>
        <p className="relative mt-0.5 text-xs font-semibold" style={{ color: hub.color }}>
          {hub.tagline}
        </p>
        <p className="relative mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {hub.description}
        </p>

        <div className="relative mt-2.5 flex flex-wrap gap-1">
          {hub.features.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-background/40 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
            >
              <Check className="h-2.5 w-2.5 opacity-60" style={{ color: hub.color }} />
              {f}
            </span>
          ))}
        </div>

        {/* Mini metric strip */}
        <div
          className="relative mt-3 flex items-center justify-between rounded-lg border px-2 py-1.5"
          style={{ borderColor: `${hub.color}33`, background: `${hub.color}0d` }}
        >
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
            {hub.metricLabel}
          </span>
          <span className="text-xs font-extrabold tabular-nums" style={{ color: hub.color }}>
            {hub.metric}
          </span>
        </div>

        <span
          className="relative mt-auto flex items-center gap-1 pt-3 text-xs font-bold"
          style={{ color: hub.color }}
        >
          Open {hub.name}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

function FlowToolCard({
  tool,
  index,
  reduce,
  tone = "admin",
}: {
  tool: FlowTool;
  index: number;
  reduce: boolean | null;
  tone?: "creator" | "admin";
}) {
  const Icon = tool.icon;
  const accent = tone === "creator" ? "#14b8a6" : "#f97316";
  const border =
    tone === "creator"
      ? "border-teal-500/35 hover:border-teal-400/55 hover:shadow-teal-500/25"
      : "border-orange-500/35 hover:border-orange-400/55 hover:shadow-orange-500/25";
  const bg =
    tone === "creator"
      ? "from-teal-500/12 shadow-teal-500/10"
      : "from-orange-500/12 shadow-orange-500/10";
  const badgeCls =
    tone === "creator"
      ? "border-teal-400/40 bg-teal-500/15 text-teal-300"
      : "border-orange-400/40 bg-orange-500/15 text-orange-300";
  const ctaCls = tone === "creator" ? "text-teal-300" : "text-orange-300";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      whileHover={reduce ? undefined : { y: -5, scale: 1.02 }}
      className="relative z-10 min-w-0 flex-1"
    >
      <Link
        href={tool.path}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-b to-card/95 p-3.5 shadow-lg backdrop-blur-xl transition md:p-4",
          border,
          bg
        )}
      >
        <ScanCorners color={accent} />
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />

        <div className="relative flex items-center justify-between gap-1">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg ring-1"
            style={{
              color: tool.color,
              background: `${tool.color}22`,
              boxShadow: `inset 0 0 0 1px ${tool.color}44`,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <span
              className={cn(
                "rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                badgeCls
              )}
            >
              {tool.badge}
            </span>
            <span className={cn("inline-flex items-center gap-0.5 text-[8px] font-semibold opacity-80", ctaCls)}>
              <Lock className="h-2.5 w-2.5" />
              {tool.status}
            </span>
          </div>
        </div>
        <h3 className="relative mt-2 font-display text-sm font-bold md:text-base">{tool.name}</h3>
        <p className="relative mt-0.5 text-[11px] text-muted-foreground">{tool.tagline}</p>
        <div className={cn("relative mt-2 flex items-center gap-1 text-[9px] opacity-80", ctaCls)}>
          <Check className="h-3 w-3 text-emerald-400" />
          {tone === "creator" ? "Creator pipeline" : "Role-gated access"}
        </div>
        <span className={cn("relative mt-auto flex items-center gap-1 pt-2.5 text-[11px] font-bold", ctaCls)}>
          Open
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

function LayerLabel({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: "public" | "creator" | "admin" | "verse";
}) {
  return (
    <div
      className={cn(
        "mb-3 hidden items-center gap-2 lg:flex",
        (tone === "admin" || tone === "creator") && "mt-1"
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
          tone === "public" && "border-neon-purple/30 bg-neon-purple/10 text-neon-purple",
          tone === "verse" && "border-violet-400/40 bg-violet-500/10 text-violet-300",
          tone === "creator" && "border-teal-400/40 bg-teal-500/10 text-teal-300",
          tone === "admin" && "border-orange-400/40 bg-orange-500/10 text-orange-300"
        )}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
    </div>
  );
}

function LayerBadge({
  icon: Icon,
  label,
  tone,
  reduce,
}: {
  icon: LucideIcon;
  label: string;
  tone: "creator" | "admin";
  reduce: boolean | null;
}) {
  const isCreator = tone === "creator";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-md",
        isCreator
          ? "border-teal-400/55 bg-teal-500/15 text-teal-300 shadow-[0_0_28px_rgba(20,184,166,0.35)]"
          : "border-orange-400/55 bg-orange-500/15 text-orange-300 shadow-[0_0_28px_rgba(249,115,22,0.4)]"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal",
          isCreator ? "bg-teal-500/25 text-teal-100" : "bg-orange-500/25 text-orange-200"
        )}
      >
        {isCreator ? "write · schedule · reach" : "staff only"}
      </span>
    </motion.div>
  );
}

/** Process-flow board — fixed arrows + richer card detailing. */
export function PlatformModulesStrip() {
  const reduce = useReducedMotion();
  const coreJogs: Array<"up" | "down"> = ["up", "down", "up", "down"];
  const verseJogs: Array<"up" | "down"> = ["up", "down"];
  const cardOffset = ["", "-translate-y-3", "translate-y-1", "translate-y-4", "-translate-y-2"];
  const coreStepLabels = ["01→02", "02→03", "03→04", "04→05"];
  const verseStepLabels = ["V1→V2", "V2→V3"];
  const hubColors = ALL_HUBS.map((h) => h.color);

  return (
    <section
      className="relative overflow-hidden border-y border-border/40"
      aria-labelledby="platform-modules-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(168,85,247,0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_85%,rgba(249,115,22,0.12),transparent_50%)]" />
      <div className="absolute inset-0 grid-noise opacity-[0.14] pointer-events-none" />

      <div className="container relative py-14 md:py-20">
        <Reveal>
          <header className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-neon-purple/35 bg-neon-purple/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neon-purple">
              <Zap className="h-3.5 w-3.5" />
              Platform flow
            </p>
            <h2
              id="platform-modules-heading"
              className="font-display text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl"
            >
              Explore <span className="text-gradient">ContentVerse</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Follow the dashed path — public hubs, Verse tools (Cine · Gold · Money), creator studio, then staff ops.
            </p>

            {/* Pipeline stats */}
            <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "8 public hubs", icon: Activity },
                { label: "3 Verse modules", icon: Gem },
                { label: "4 creator tools", icon: PenSquare },
                { label: "5 staff tools", icon: Shield },
              ].map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur"
                >
                  <s.icon className="h-3 w-3 text-neon-purple" />
                  {s.label}
                </span>
              ))}
            </div>
          </header>
        </Reveal>

        {/* ── Desktop flowchart ── */}
        <div className="mx-auto hidden max-w-6xl lg:block">
          <LayerLabel icon={Compass} label="Public layer · read · watch · earn" tone="public" />

          <div className="relative flex items-stretch gap-0 px-1 pt-2">
            {CORE_HUBS.map((hub, i) => (
              <div key={hub.path} className="contents">
                <HubCard
                  hub={hub}
                  index={i}
                  reduce={reduce}
                  className={cardOffset[i]}
                />
                {i < CORE_HUBS.length - 1 && (
                  <StepConnector
                    color={hub.color}
                    jog={coreJogs[i]}
                    label={coreStepLabels[i]}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="relative z-10 my-5 flex flex-col items-center">
            <DropConnector from="#ec4899" to="#a78bfa" label="verse" id="drop-verse" />
            <LayerLabel
              icon={Sparkles}
              label="Verse hubs · CineVerse · GoldVerse · MoneyVerse"
              tone="verse"
            />
          </div>

          <div className="relative mx-auto flex max-w-4xl items-stretch gap-0 px-1">
            {VERSE_HUBS.map((hub, i) => (
              <div key={hub.path} className="contents">
                <HubCard
                  hub={hub}
                  index={CORE_HUBS.length + i}
                  reduce={reduce}
                  className={i === 1 ? "translate-y-2" : i === 2 ? "-translate-y-1" : ""}
                />
                {i < VERSE_HUBS.length - 1 && (
                  <StepConnector
                    color={hub.color}
                    jog={verseJogs[i]}
                    label={verseStepLabels[i]}
                  />
                )}
              </div>
            ))}
          </div>

          <Link
            href={MONEYVERSE_OCR.path}
            className="mx-auto mt-4 hidden max-w-md items-center justify-between gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs backdrop-blur transition hover:bg-violet-500/15 lg:flex"
          >
            <span className="inline-flex items-center gap-2 font-semibold text-violet-200">
              <ScanLine className="h-4 w-4" />
              MoneyVerse — Screenshot Scan (OCR)
            </span>
            <span className="text-muted-foreground">
              {MONEYVERSE_OCR.features.join(" · ")}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-300" />
          </Link>

          <CollectorRail hubColors={hubColors} />

          {/* Creator studio */}
          <div className="relative z-10 flex flex-col items-center">
            <DropConnector from="#ec4899" to="#14b8a6" label="create" id="drop-creator" />
            <LayerBadge
              icon={PenSquare}
              label="Creator studio"
              tone="creator"
              reduce={reduce}
            />
          </div>

          <FanRail columns={CREATOR_TOOLS.length} color="#14b8a6" />

          <LayerLabel icon={PenLine} label="Creator layer · write · schedule · reach" tone="creator" />

          <div className="relative flex items-stretch gap-0 px-1">
            {CREATOR_TOOLS.map((tool, i) => (
              <div key={tool.path + tool.name} className="contents">
                <FlowToolCard tool={tool} index={i} reduce={reduce} tone="creator" />
                {i < CREATOR_TOOLS.length - 1 && (
                  <StepConnector
                    color={tool.color}
                    jog={i % 2 === 0 ? "up" : "down"}
                    label={["write", "time", "reach"][i]}
                    className="self-center"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Admin control room */}
          <div className="relative z-10 mt-2 flex flex-col items-center">
            <DropConnector from="#14b8a6" to="#f97316" label="ops" id="drop-admin" />
            <LayerBadge
              icon={Shield}
              label="Admin control room"
              tone="admin"
              reduce={reduce}
            />
          </div>

          <FanRail columns={ADMIN_TOOLS.length} color="#f97316" />

          <LayerLabel icon={Shield} label="Staff layer · moderation & ops" tone="admin" />

          <div className="relative flex items-stretch gap-0 px-1 pb-2">
            {ADMIN_TOOLS.map((tool, i) => (
              <div key={tool.path + tool.name} className="contents">
                <FlowToolCard tool={tool} index={i} reduce={reduce} tone="admin" />
                {i < ADMIN_TOOLS.length - 1 && (
                  <StepConnector
                    color={tool.color}
                    jog={i % 2 === 0 ? "down" : "up"}
                    label={`A${i + 1}→A${i + 2}`}
                    className="self-center"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="relative lg:hidden">
          <svg
            className="pointer-events-none absolute bottom-4 left-5 top-4 w-6"
            viewBox="0 0 24 800"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="mob-rail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="40%" stopColor="#3b82f6" />
                <stop offset="70%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <path
              d="M12 8 V80 H18 V160 H12 V240 H18 V320 H12 V400 H18 V480 H12 V560 H18 V640 H12 V760"
              fill="none"
              stroke="url(#mob-rail)"
              strokeWidth="2.4"
              strokeDasharray="4 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="journey-path"
            />
            {/* Explicit down arrow at end */}
            <polygon points="8,760 12,772 16,760" fill="#f97316" />
          </svg>

          <div className="flex flex-col gap-4 pl-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neon-purple">
              Public layer
            </p>
            {CORE_HUBS.map((hub, i) => (
              <div key={hub.path} className="relative">
                <span
                  className="absolute -left-[2.15rem] top-6 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background"
                  style={{ background: hub.color, boxShadow: `0 0 12px ${hub.glow}` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <HubCard hub={hub} index={i} reduce={reduce} />
              </div>
            ))}

            <div className="relative py-2">
              <span className="absolute -left-[2.15rem] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-violet-500 ring-4 ring-background shadow-[0_0_14px_rgba(139,92,246,0.6)]">
                <Gem className="h-3 w-3 text-white" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
                Verse hubs · CineVerse · GoldVerse · MoneyVerse
              </p>
            </div>

            {VERSE_HUBS.map((hub, i) => (
              <div key={hub.path} className="relative">
                <span
                  className="absolute -left-[2.15rem] top-6 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background"
                  style={{ background: hub.color, boxShadow: `0 0 12px ${hub.glow}` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <HubCard hub={hub} index={CORE_HUBS.length + i} reduce={reduce} />
              </div>
            ))}

            <Link
              href={MONEYVERSE_OCR.path}
              className="relative rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-2 font-semibold text-violet-200">
                <ScanLine className="h-4 w-4" />
                Screenshot Scan (OCR)
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {MONEYVERSE_OCR.tagline} — {MONEYVERSE_OCR.features.join(" · ")}
              </p>
            </Link>

            <div className="relative py-2">
              <span className="absolute -left-[2.15rem] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-teal-500 ring-4 ring-background shadow-[0_0_14px_rgba(20,184,166,0.6)]">
                <PenSquare className="h-3 w-3 text-white" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300">
                Creator studio · write · schedule · reach
              </p>
            </div>

            {CREATOR_TOOLS.map((tool, i) => (
              <div key={tool.path + tool.name} className="relative">
                <span
                  className="absolute -left-[2.15rem] top-5 flex h-4 w-4 rounded-full ring-4 ring-background"
                  style={{ background: tool.color, boxShadow: `0 0 10px ${tool.color}88` }}
                />
                <FlowToolCard tool={tool} index={i} reduce={reduce} tone="creator" />
              </div>
            ))}

            <div className="relative py-2">
              <span className="absolute -left-[2.15rem] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 ring-4 ring-background shadow-[0_0_14px_rgba(249,115,22,0.6)]">
                <Shield className="h-3 w-3 text-white" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300">
                Admin control room · staff only
              </p>
            </div>

            {ADMIN_TOOLS.map((tool, i) => (
              <div key={tool.path + tool.name} className="relative">
                <span
                  className="absolute -left-[2.15rem] top-5 flex h-4 w-4 rounded-full ring-4 ring-background"
                  style={{ background: tool.color, boxShadow: `0 0 10px ${tool.color}88` }}
                />
                <FlowToolCard tool={tool} index={i} reduce={reduce} tone="admin" />
              </div>
            ))}
          </div>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card/80 px-6 py-5 backdrop-blur-xl sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-bold">Your story could be the next stop</p>
                <p className="text-xs text-muted-foreground">
                  Write, schedule, publish — free to start.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-neon-purple/30 transition hover:brightness-110"
              >
                Start writing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/15 px-5 py-2.5 text-sm font-bold text-orange-300 transition hover:bg-orange-500/25"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
