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
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/blogs", label: "Articles", icon: Compass },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/results", label: "Results", icon: FileSearch },
];

export const NAV_DROPDOWNS: NavDropdown[] = [
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    items: [
      {
        href: "/guides",
        label: "India Guides",
        description: "Schemes, money, jobs, cricket",
        icon: BookOpen,
      },
      { href: "/blogs", label: "Articles", description: "Long-form stories & explainers", icon: Compass },
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
    label: "More",
    icon: Gem,
    items: [
      {
        href: "/guides/money",
        label: "Money Guides",
        description: "SIP, CIBIL, 80C, EMI & tax",
        icon: TrendingUp,
      },
      { href: "/guides/schemes", label: "Scheme Guides", description: "Eligibility & how to apply", icon: BookOpen },
      { href: "/cineverse", label: "CineVerse", description: "Movies, OTT & watchlist", icon: Clapperboard },
      { href: "/goldverse", label: "GoldVerse", description: "Gold rates & hallmark tips", icon: Gem },
      { href: "/moneyverse", label: "MoneyVerse", description: "Expense tracker India", icon: Wallet },
      { href: "/tools", label: "India Tools", description: "Calculators that support guides", icon: Wrench },
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
