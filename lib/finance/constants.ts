/** Yahoo Finance symbols for Indian indices */
export const NIFTY_INDEX = "^NSEI";
export const SENSEX_INDEX = "^BSESN";

/** Nifty 50 constituents for gainers/losers (Yahoo `.NS` suffix) */
export const NIFTY50_SYMBOLS = [
  "RELIANCE.NS",
  "TCS.NS",
  "HDFCBANK.NS",
  "INFY.NS",
  "ICICIBANK.NS",
  "HINDUNILVR.NS",
  "ITC.NS",
  "SBIN.NS",
  "BHARTIARTL.NS",
  "KOTAKBANK.NS",
  "LT.NS",
  "AXISBANK.NS",
  "ASIANPAINT.NS",
  "MARUTI.NS",
  "SUNPHARMA.NS",
  "TITAN.NS",
  "BAJFINANCE.NS",
  "HCLTECH.NS",
  "WIPRO.NS",
  "ULTRACEMCO.NS",
  "NTPC.NS",
  "POWERGRID.NS",
  "M&M.NS",
  "TMPV.NS",
  "TMCV.NS",
  "ADANIENT.NS",
  "ADANIPORTS.NS",
  "JSWSTEEL.NS",
  "ONGC.NS",
  "COALINDIA.NS",
  "TATASTEEL.NS",
  "INDUSINDBK.NS",
  "GRASIM.NS",
  "DRREDDY.NS",
  "CIPLA.NS",
  "APOLLOHOSP.NS",
  "EICHERMOT.NS",
  "BRITANNIA.NS",
  "DIVISLAB.NS",
  "HEROMOTOCO.NS",
  "BAJAJ-AUTO.NS",
  "NESTLEIND.NS",
  "HINDALCO.NS",
  "TECHM.NS",
  "BEL.NS",
  "TRENT.NS",
  "SHRIRAMFIN.NS",
  "SBILIFE.NS",
  "HDFCLIFE.NS",
  "TATACONSUM.NS",
  "BAJAJFINSV.NS",
] as const;

/** Featured top stocks for quick display */
export const TOP10_STOCKS = [
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "SBIN.NS",
  "BHARTIARTL.NS",
  "ITC.NS",
  "LT.NS",
  "HINDUNILVR.NS",
] as const;

/** Server cache for Yahoo/NSE data (seconds). Override via FINANCE_CACHE_TTL_SECONDS. */
export const FINANCE_CACHE_TTL =
  Number(process.env.FINANCE_CACHE_TTL_SECONDS) > 0
    ? Number(process.env.FINANCE_CACHE_TTL_SECONDS)
    : 300;

/** Client poll intervals — keep low to avoid hammering Yahoo on every page. */
export const FINANCE_TICKER_POLL_MS = 120_000;
export const FINANCE_HUB_POLL_MS = 120_000;
export const FINANCE_STOCK_POLL_MS = 120_000;
