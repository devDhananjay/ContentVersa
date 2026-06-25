import {
  getFinanceHubData,
  getFinanceTickerData,
  getStockDetail,
} from "./yahoo";
import { resolveFinanceSymbol } from "./transformers";

// Do not wrap with React `cache()` here.
// The underlying `yahoo.ts` already uses Redis/in-memory TTL caching,
// so we want every `router.refresh()` to respect that TTL.
export async function getFinanceTickerDataCached() {
  return getFinanceTickerData();
}

export async function getFinanceHubDataCached() {
  return getFinanceHubData();
}

export async function getStockDetailCached(symbol: string) {
  return getStockDetail(resolveFinanceSymbol(symbol));
}
