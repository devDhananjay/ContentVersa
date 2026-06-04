"use client";

import { AutoPushPermission } from "@/components/notifications/auto-push-permission";
import { RecordSiteVisit } from "@/components/site/record-site-visit";

export function AppEffects() {
  return (
    <>
      <RecordSiteVisit />
      <AutoPushPermission />
    </>
  );
}
