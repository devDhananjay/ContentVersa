"use client";

import {
  Banknote,
  Calculator,
  Car,
  Fuel,
  IndianRupee,
  MapPin,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { ToolSlug } from "@/lib/tools/registry";

const ICONS: Record<ToolSlug, LucideIcon> = {
  "ifsc-finder": Banknote,
  "pincode-finder": MapPin,
  "rto-finder": Car,
  "vehicle-plate-decoder": Search,
  "pan-gstin-checker": ShieldCheck,
  "emi-calculator": Calculator,
  "sip-calculator": IndianRupee,
  "fuel-price": Fuel,
};

export function ToolIcon({ slug, className }: { slug: ToolSlug; className?: string }) {
  const Icon = ICONS[slug];
  return <Icon className={className} />;
}
