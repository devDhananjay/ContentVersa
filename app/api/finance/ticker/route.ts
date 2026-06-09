import { getFinanceTickerData } from "@/lib/finance/yahoo";
import { financeJsonResponse } from "@/lib/finance/api-response";

export async function GET() {
  try {
    const data = await getFinanceTickerData();
    return financeJsonResponse(data);
  } catch (err) {
    console.error("[api/finance/ticker]", err);
    return financeJsonResponse(
      { error: "Failed to load market ticker" },
      503
    );
  }
}
