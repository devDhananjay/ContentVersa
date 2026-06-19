"use client";

import { AutoPushPermission } from "@/components/notifications/auto-push-permission";
import { BrandingSplash } from "@/components/site/branding-splash";
import { RecordSiteVisit } from "@/components/site/record-site-visit";
import { ScrollToTop } from "@/components/site/scroll-to-top";

export function AppEffects() {
  return (
    <>
      <BrandingSplash />
      <ScrollToTop />
      <RecordSiteVisit />
      <AutoPushPermission />
    </>
  );
}
