import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  BookOpen,
  Briefcase,
  Clapperboard,
  Compass,
  FileSearch,
  Film,
  Flame,
  Gem,
  LayoutDashboard,
  Map,
  Medal,
  ScanLine,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";

export type NavLinkItem = {
  href: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

export type NavDropdown = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavLinkItem[];
};

export const NAV_TOP_LINKS: NavLinkItem[] = [
  { href: "/trending", label: "Trending Now", icon: Flame },
  { href: "/sports", label: "Sports", icon: Medal },
  { href: "/finance", label: "Finance", icon: TrendingUp },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
];

export const NAV_DROPDOWNS: NavDropdown[] = [
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    items: [
      { href: "/blogs", label: "Articles", description: "Discover stories & ideas", icon: Compass },
      {
        href: "/guides",
        label: "India Guides",
        description: "Schemes, jobs, trends, OTT",
        icon: BookOpen,
      },
      { href: "/results", label: "Sarkari Result", description: "Official exam & board results", icon: FileSearch },
      { href: "/reels", label: "Reels", description: "Short videos", icon: Film },
      { href: "/categories", label: "Categories", description: "21+ topics to follow", icon: LayoutDashboard },
      { href: "/bookmarks", label: "Bookmarks", description: "Your saved reads", icon: Bookmark },
      { href: "/site-map", label: "Site map", description: "Every page at a glance", icon: Map },
    ],
  },
  {
    id: "verse",
    label: "Verse",
    icon: Gem,
    items: [
      { href: "/cineverse", label: "CineVerse", description: "Movies, OTT & watchlist", icon: Clapperboard },
      { href: "/goldverse", label: "GoldVerse", description: "Gold & silver rates, hallmark", icon: Gem },
      { href: "/moneyverse", label: "MoneyVerse", description: "Expense tracker India", icon: Wallet },
      {
        href: "/finance#money-guides",
        label: "Money Guides",
        description: "Gold, SIP, FD, loans & tax",
        icon: TrendingUp,
      },
      {
        href: "/moneyverse/screenshot-scan",
        label: "Screenshot OCR",
        description: "UPI payment scan",
        icon: ScanLine,
      },
      {
        href: "/moneyverse/bank-statement-analyzer",
        label: "Bank Statement",
        description: "AI statement analysis",
        icon: FileSearch,
      },
      { href: "/huid-verification", label: "HUID Check", description: "Verify BIS hallmark", icon: ShieldCheck },
      { href: "/tools", label: "India Tools", description: "IFSC, PNR, translator & more", icon: Wrench },
      { href: "/tools/pnr-status", label: "PNR Status", description: "Indian Railways PNR check", icon: Wrench },
      { href: "/tools/english-hindi-translator", label: "EN ↔ HI", description: "English Hindi translator", icon: BookOpen },
      { href: "/tools/silver-rate", label: "Silver Rate", description: "Today's silver price India", icon: Gem },
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
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isDropdownActive(pathname: string | null, items: NavLinkItem[]) {
  return items.some((item) => isNavActive(pathname, item.href));
}
