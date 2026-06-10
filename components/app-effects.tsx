"use client";

import { AutoPushPermission } from "@/components/notifications/auto-push-permission";
import { RecordSiteVisit } from "@/components/site/record-site-visit";
import { ScrollToTop } from "@/components/site/scroll-to-top";

export function AppEffects() {
  return (
    <>
      <ScrollToTop />
      <RecordSiteVisit />
      <AutoPushPermission />
    </>
  );
}
