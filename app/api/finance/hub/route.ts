import { getFinanceHubData } from "@/lib/finance/yahoo";
import { financeJsonResponse } from "@/lib/finance/api-response";

export async function GET() {
  try {
    const data = await getFinanceHubData();
    return financeJsonResponse(data);
  } catch (err) {
    console.error("[api/finance/hub]", err);
    return financeJsonResponse({ error: "Failed to load finance hub" }, 503);
  }
}

