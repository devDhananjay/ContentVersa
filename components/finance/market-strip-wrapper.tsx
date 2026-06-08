import { getFinanceTickerDataCached } from "@/lib/finance/data";
import { MarketStripLive } from "./market-strip-live";

export async function MarketStripWrapper() {
  try {
    const data = await getFinanceTickerDataCached();
    return <MarketStripLive initialData={data} />;
  } catch (err) {
    console.error("[finance] market strip failed", err);
    return null;
  }
}
