export interface StockQuote {
  symbol: string;
  shortName: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: number;
}

export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface FinanceTickerData {
  nifty: IndexQuote;
  sensex: IndexQuote;
  topGainers: StockQuote[];
  updatedAt: string;
}

export interface FinanceHubData {
  nifty: IndexQuote;
  sensex: IndexQuote;
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  top10: StockQuote[];
  updatedAt: string;
}

export interface StockChartPoint {
  date: string;
  close: number;
}

export interface StockDetailData {
  quote: StockQuote;
  chart: StockChartPoint[];
}
