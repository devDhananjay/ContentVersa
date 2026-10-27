import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  BookOpen,
  Briefcase,
  Clapperboard,
  Compass,
  FileSearch,
  Flame,
  Gem,
  LayoutDashboard,
  Map,
  Medal,
  Radio,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";

export type NavLinkItem = {
  href: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  /** Show blinking red live indicator (News) */
  live?: boolean;
};

export type NavDropdown = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavLinkItem[];
};

export const NAV_TOP_LINKS: NavLinkItem[] = [
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/news", label: "News", icon: Radio, live: true },
  { href: "/blogs", label: "Articles", icon: Compass },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/results", label: "Results", icon: FileSearch },
];

export const NAV_DROPDOWNS: NavDropdown[] = [
  {
    id: "explore",
    label: "Discover",
    icon: Compass,
    items: [
      {
        href: "/guides",
        label: "India Guides",
        description: "Schemes, money, jobs, cricket",
        icon: BookOpen,
      },
      { href: "/blogs", label: "Articles", description: "Long-form stories & explainers", icon: Compass },
      {
        href: "/news",
        label: "Live News",
        description: "India desk briefings, updating live",
        icon: Radio,
        live: true,
      },
      { href: "/results", label: "Exam Results", description: "Official exam & board portals", icon: FileSearch },
      { href: "/categories", label: "Categories", description: "Topics to follow", icon: LayoutDashboard },
      { href: "/sports", label: "Sports", description: "Live cricket scores", icon: Medal },
      { href: "/finance", label: "Finance", description: "Markets & money links", icon: TrendingUp },
      { href: "/trending", label: "Trending", description: "What India is searching", icon: Flame },
      { href: "/bookmarks", label: "Bookmarks", description: "Your saved reads", icon: Bookmark },
      { href: "/site-map", label: "Site map", description: "Every page at a glance", icon: Map },
    ],
  },
  {
    id: "verse",
    label: "Tools",
    icon: Wrench,
    items: [
      {
        href: "/tools",
        label: "India Tools",
        description: "SIP, EMI, tax, IFSC, PNR & 30+ free tools",
        icon: Wrench,
      },
      {
        href: "/ai",
        label: "ContentVerse AI",
        description: "Ask, summarise, resume, OCR & finance",
        icon: Flame,
      },
      {
        href: "/moneyverse",
        label: "MoneyVerse",
        description: "Expense tracker, screenshot OCR, bank PDF",
        icon: Wallet,
      },
      {
        href: "/goldverse",
        label: "GoldVerse",
        description: "Gold rates, HUID & hallmark tips",
        icon: Gem,
      },
      {
        href: "/cineverse",
        label: "CineVerse",
        description: "Movies, OTT & watchlist",
        icon: Clapperboard,
      },
      {
        href: "/guides/money",
        label: "Money Guides",
        description: "SIP, CIBIL, 80C, EMI & tax",
        icon: TrendingUp,
      },
      {
        href: "/guides/schemes",
        label: "Scheme Guides",
        description: "Eligibility & how to apply",
        icon: BookOpen,
      },
    ],
  },
];

/** Flat list for mobile drawer & active-route checks */
export const NAV_MOBILE_LINKS: NavLinkItem[] = [
  ...NAV_DROPDOWNS.flatMap((d) => d.items),
  ...NAV_TOP_LINKS,
];

export function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  // Ignore /hi locale prefix for active-state matching
  const path =
    pathname === "/hi"
      ? "/"
      : pathname.startsWith("/hi/")
        ? pathname.slice(3)
        : pathname;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

export function isDropdownActive(pathname: string | null, items: NavLinkItem[]) {
  return items.some((item) => isNavActive(pathname, item.href));
}
