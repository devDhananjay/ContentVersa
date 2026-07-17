import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Briefcase,
  Clapperboard,
  Compass,
  FileSearch,
  Film,
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
  { href: "/sports", label: "Sports", icon: Medal },
  { href: "/finance", label: "Finance", icon: TrendingUp },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/reels", label: "Reels", icon: Film },
];

export const NAV_DROPDOWNS: NavDropdown[] = [
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    items: [
      { href: "/blogs", label: "Articles", description: "Discover stories & ideas", icon: Compass },
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
      { href: "/goldverse", label: "GoldVerse", description: "Gold rates & hallmark", icon: Gem },
      { href: "/moneyverse", label: "MoneyVerse", description: "Expense tracker India", icon: Wallet },
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
      { href: "/tools", label: "India Tools", description: "IFSC, pincode, RTO & more", icon: Wrench },
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
