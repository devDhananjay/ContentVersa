import { getFinanceTickerData } from "@/lib/finance/yahoo";
import { displaySymbol } from "@/lib/finance/transformers";
import type { FeedItem } from "./types";

export async function fetchFinanceFeed(limit = 8): Promise<FeedItem[]> {
  const data = await getFinanceTickerData();
  const stocks = data.topGainers.slice(0, limit);

  return stocks.map((stock) => {
    const symbol = displaySymbol(stock.symbol);
    const sign = stock.changePercent >= 0 ? "+" : "";
    return {
      id: stock.symbol,
      title: symbol,
      externalUrl: `https://finance.yahoo.com/quote/${stock.symbol}`,
      subtitle: stock.shortName,
      meta: `${sign}${stock.changePercent.toFixed(2)}% · ₹${stock.price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    };
  });
}
