"use client";

import {
  Banknote,
  Barcode,
  Calculator,
  Calendar,
  Car,
  CloudSun,
  Fingerprint,
  Fuel,
  IndianRupee,
  MapPin,
  MapPinned,
  QrCode,
  School,
  ShieldCheck,
  Stethoscope,
  Utensils,
  Vote,
  Wallet,
  Hotel,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { ToolSlug } from "@/lib/tools/registry";

const ICONS: Record<ToolSlug, LucideIcon> = {
  "ifsc-finder": Banknote,
  "pincode-finder": MapPin,
  "rto-finder": Car,
  "vehicle-plate-decoder": Search,
  "pan-gstin-checker": ShieldCheck,
  "fssai-checker": Utensils,
  "emi-calculator": Calculator,
  "sip-calculator": IndianRupee,
  "fuel-price": Fuel,
  weather: CloudSun,
  "currency-converter": Wallet,
  "age-calculator": Calendar,
  "qr-generator": QrCode,
  "barcode-generator": Barcode,
  "uuid-generator": Fingerprint,
  "indian-holidays": Calendar,
  "election-info": Vote,
  "geo-location": MapPinned,
  "nearby-places": MapPin,
  "nearby-hotels": Hotel,
  "nearby-restaurants": Utensils,
  "nearby-hospitals": Stethoscope,
  "nearby-schools": School,
  "nearby-atms": Banknote,
};

export function ToolIcon({ slug, className }: { slug: ToolSlug; className?: string }) {
  const Icon = ICONS[slug];
  return <Icon className={className} />;
}
