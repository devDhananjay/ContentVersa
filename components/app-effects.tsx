"use client";

import { AutoPushPermission } from "@/components/notifications/auto-push-permission";
import { A11yAnnouncerProvider } from "@/components/a11y/a11y-announcer";
import { AccessibilityToolbar } from "@/components/a11y/accessibility-toolbar";
import { ColorVisionProvider } from "@/components/a11y/color-vision-provider";
import { ScreenReaderProvider } from "@/components/a11y/screen-reader-provider";
import { RecordSiteVisit } from "@/components/site/record-site-visit";
import { ScrollToTop } from "@/components/site/scroll-to-top";

export function AppEffects() {
  return (
    <A11yAnnouncerProvider>
      <ScreenReaderProvider>
        <ColorVisionProvider>
          <ScrollToTop />
          <RecordSiteVisit />
          <AutoPushPermission />
          <AccessibilityToolbar />
        </ColorVisionProvider>
      </ScreenReaderProvider>
    </A11yAnnouncerProvider>
  );
}
