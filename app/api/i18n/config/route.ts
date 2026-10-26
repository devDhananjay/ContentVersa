import { NextResponse } from "next/server";
import { I18N_POLICY, isAiHiTranslateEnabled } from "@/lib/i18n/policy";

/** Public: what free/paid i18n features are on (no secrets). */
export async function GET() {
  return NextResponse.json({
    primaryLocale: I18N_POLICY.primaryLocale,
    supportedLocales: I18N_POLICY.supportedLocales,
    /** UI dictionaries always on (free). */
    uiI18n: true,
    /** Content AI translate — env ENABLE_AI_HI_TRANSLATE=1 */
    aiHiTranslate: isAiHiTranslateEnabled(),
    autoEnqueueHiOnPublish: I18N_POLICY.autoEnqueueHiOnPublish,
  });
}
