import { ImageResponse } from "next/og";
import { getToolBySlug } from "@/lib/tools/registry";

export const TOOL_OG_SIZE = { width: 1200, height: 630 };
export const TOOL_OG_ALT = "ContentVerse India Tools";
export const TOOL_OG_CONTENT_TYPE = "image/png";

export async function renderToolOgImage(slug: string) {
  const tool = getToolBySlug(slug);
  const title = tool?.shortTitle ?? "India Tools";
  const badge = tool?.badge ?? "Utility";
  const raw = tool?.description ?? "Free India utility tools on ContentVerse India";
  const blurb = raw.length > 140 ? `${raw.slice(0, 140)}…` : raw;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "linear-gradient(145deg, #0b0b12 0%, #141428 45%, #1a1030 100%)",
          color: "#f8fafc",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #a855f7)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            CV
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>
              ContentVerse India
            </div>
            <div style={{ display: "flex", fontSize: 16, color: "#94a3b8" }}>
              Free India Tools
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#c4b5fd",
              border: "1px solid rgba(196,181,253,0.35)",
              borderRadius: 999,
              padding: "8px 16px",
            }}
          >
            {badge}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 28 ? 56 : 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#cbd5e1",
              lineHeight: 1.35,
              maxWidth: 920,
            }}
          >
            {blurb}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#94a3b8",
          }}
        >
          <div style={{ display: "flex" }}>
            contentverse.co.in/tools/{slug}
          </div>
          <div style={{ display: "flex", color: "#a78bfa", fontWeight: 600 }}>
            No sign-up
          </div>
        </div>
      </div>
    ),
    { ...TOOL_OG_SIZE }
  );
}
