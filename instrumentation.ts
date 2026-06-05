export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startSportsAutoSync } = await import("@/lib/sports/auto-sync");
  startSportsAutoSync();
}
