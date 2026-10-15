/**
 * Pause nightly AI article auto-generation.
 *
 *   npx tsx scripts/pause-ai-autogen.ts
 */
import { getAiAutoGenSettings, setAiAutoGenEnabled } from "../lib/ai/auto-gen-toggle";
import { loadScriptEnv } from "./load-script-env";

loadScriptEnv();

async function main() {
  await setAiAutoGenEnabled(false);
  const s = await getAiAutoGenSettings();
  console.log(`AI auto-gen enabled: ${s.enabled}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
