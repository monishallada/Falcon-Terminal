import { Instrument } from "./types";

// Curated universe — a believable cross-section of US equities, ETFs, crypto, FX,
// commodities, indices, and rates. Numbers are realistic order-of-magnitude figures
// used purely for the simulator and screener UI.
export const INSTRUMENTS: Instrument[] = [
  // Mega-cap tech
  { symbol: "AAPL", name: "Apple Inc.",                  asset: "equity", sector: "Technology",            exchange: "NASDAQ", basePrice: 224.31, vol: 0.22, marketCap: 3_410_000_000_000, pe: 32.5, pegRatio: 2.4, divYield: 0.0044, beta: 1.24, earningsGrowth: 0.09, revenueGrowth: 0.04, profitMargin: 0.262, high52: 237.23, low52: 164.08, avgVolume: 58_000_000, description: "Designs, manufactures, and markets smartphones, computers, tablets, and wearables." },
  { symbol: "MSFT", name: "Microsoft Corporation",       asset: "equity", sector: "Technology",            exchange: "NASDAQ", basePrice: 416.42, vol: 0.21, marketCap: 3_090_000_000_000, pe: 36.1, pegRatio: 2.1, divYield: 0.0073, beta: 0.91, earningsGrowth: 0.20, revenueGrowth: 0.16, profitMargin: 0.366, high52: 468.35, low52: 309.45, avgVolume: 21_000_000, description: "Cloud, productivity, gaming, and AI platform leader." },
  { symbol: "NVDA", name: "NVIDIA Corporation",          asset: "equity", sector: "Technology",            exchange: "NASDAQ", basePrice: 138.07, vol: 0.55, marketCap: 3_400_000_000_000, pe: 73.4, pegRatio: 1.6, divYield: 0.0003, beta: 1.66, earningsGrowth: 1.50, revenueGrowth: 1.22, profitMargin: 0.554, high52: 152.89, low52: 39.23, avgVolume: 240_000_000, description: "GPUs and accelerated computing for AI, gaming, and data centers." },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A",      asset: "equity", sector: "Communication Services",exchange: "NASDAQ", basePrice: 165.29, vol: 0.27, marketCap: 2_040_000_000_000, pe: 23.7, pegRatio: 1.4, divYield: 0.0048, beta: 1.05, earningsGrowth: 0.31, revenueGrowth: 0.14, profitMargin: 0.275, high52: 191.75, low52: 127.90, avgVolume: 24_000_000, description: "Search, YouTube, Cloud, Android, and AI." },
  { symbol: "AMZN", name: "Amazon.com Inc.",             asset: "equity", sector: "Consumer Cyclical",     exchange: "NASDAQ", basePrice: 195.21, vol: 0.31, marketCap: 2_050_000_000_000, pe: 47.0, pegRatio: 1.7, beta: 1.18, earningsGrowth: 0.43, revenueGrowth: 0.13, profitMargin: 0.082, high52: 215.90, low52: 118.35, avgVolume: 36_000_000, description: "E-commerce, AWS cloud, advertising, and devices." },
  { symbol: "META", name: "Meta Platforms Inc.",         asset: "equity", sector: "Communication Services",exchange: "NASDAQ", basePrice: 596.45, vol: 0.34, marketCap: 1_510_000_000_000, pe: 27.2, pegRatio: 1.3, divYield: 0.0035, beta: 1.20, earningsGrowth: 0.59, revenueGrowth: 0.22, profitMargin: 0.341, high52: 602.95, low52: 286.79, avgVolume: 14_000_000, description: "Family of apps and Reality Labs — Facebook, Instagram, WhatsApp." },
  { symbol: "TSLA", name: "Tesla Inc.",                  asset: "equity", sector: "Consumer Cyclical",     exchange: "NASDAQ", basePrice: 248.13, vol: 0.55, marketCap: 790_000_000_000, pe: 71.2, pegRatio: 4.2, beta: 2.08, earningsGrowth: -0.05, revenueGrowth: 0.01, profitMargin: 0.073, high52: 299.29, low52: 138.80, avgVolume: 95_000_000, description: "Electric vehicles, energy storage, and autonomous driving." },
  { symbol: "AVGO", name: "Broadcom Inc.",               asset: "equity", sector: "Technology",            exchange: "NASDAQ", basePrice: 174.91, vol: 0.36, marketCap: 815_000_000_000, pe: 50.2, pegRatio: 2.8, divYield: 0.0123, beta: 1.20, earningsGrowth: 0.27, revenueGrowth: 0.43, profitMargin: 0.255, high52: 186.42, low52: 96.10, avgVolume: 27_000_000 },
  { symbol: "NFLX", name: "Netflix Inc.",                asset: "equity", sector: "Communication Services",exchange: "NASDAQ", basePrice: 770.84, vol: 0.32, marketCap: 330_000_000_000, pe: 42.6, pegRatio: 1.7, beta: 1.31, earningsGrowth: 0.62, revenueGrowth: 0.15, profitMargin: 0.197, high52: 776.50, low52: 414.06, avgVolume: 4_400_000 },
  { symbol: "AMD", name: "Advanced Micro Devices",       asset: "equity", sector: "Technology",            exchange: "NASDAQ", basePrice: 144.92, vol: 0.46, marketCap: 234_000_000_000, pe: 132.3, pegRatio: 2.8, beta: 1.71, earningsGrowth: 0.18, revenueGrowth: 0.04, profitMargin: 0.062, high52: 227.30, low52: 121.77, avgVolume: 47_000_000 },

  // Banks and finance
  { symbol: "JPM", name: "JPMorgan Chase & Co.",         asset: "equity", sector: "Financial Services",    exchange: "NYSE",   basePrice: 226.41, vol: 0.21, marketCap: 645_000_000_000, pe: 12.2, divYield: 0.0204, beta: 1.10, earningsGrowth: 0.06, revenueGrowth: 0.07, profitMargin: 0.346, high52: 230.34, low52: 165.96, avgVolume: 9_000_000 },
  { symbol: "BAC", name: "Bank of America Corp.",        asset: "equity", sector: "Financial Services",    exchange: "NYSE",   basePrice: 42.47,  vol: 0.27, marketCap: 326_000_000_000, pe: 14.7, divYield: 0.0230, beta: 1.32, earningsGrowth: -0.05, revenueGrowth: -0.01, profitMargin: 0.245, high52: 45.07,  low52: 28.27,  avgVolume: 38_000_000 },
  { symbol: "GS",  name: "Goldman Sachs Group",          asset: "equity", sector: "Financial Services",    exchange: "NYSE",   basePrice: 502.15, vol: 0.27, marketCap: 168_000_000_000, pe: 16.2, divYield: 0.0238, beta: 1.36, earningsGrowth: 0.45, revenueGrowth: 0.13, profitMargin: 0.262, high52: 519.72, low52: 326.12, avgVolume: 2_300_000 },
  { symbol: "V",   name: "Visa Inc.",                    asset: "equity", sector: "Financial Services",    exchange: "NYSE",   basePrice: 290.65, vol: 0.20, marketCap: 562_000_000_000, pe: 30.9, divYield: 0.0072, beta: 0.95, earningsGrowth: 0.16, revenueGrowth: 0.10, profitMargin: 0.547, high52: 296.39, low52: 252.70, avgVolume: 6_500_000 },

  // Healthcare & pharma
  { symbol: "LLY",  name: "Eli Lilly and Company",       asset: "equity", sector: "Healthcare",             exchange: "NYSE",   basePrice: 902.10, vol: 0.32, marketCap: 858_000_000_000, pe: 100.4, divYield: 0.0058, beta: 0.41, earningsGrowth: 0.51, revenueGrowth: 0.36, profitMargin: 0.207, high52: 972.53, low52: 539.77, avgVolume: 3_200_000 },
  { symbol: "UNH",  name: "UnitedHealth Group",          asset: "equity", sector: "Healthcare",             exchange: "NYSE",   basePrice: 568.93, vol: 0.21, marketCap: 524_000_000_000, pe: 36.6, divYield: 0.0148, beta: 0.59, earningsGrowth: -0.18, revenueGrowth: 0.08, profitMargin: 0.061, high52: 612.48, low52: 436.39, avgVolume: 3_700_000 },
  { symbol: "JNJ",  name: "Johnson & Johnson",           asset: "equity", sector: "Healthcare",             exchange: "NYSE",   basePrice: 161.78, vol: 0.16, marketCap: 390_000_000_000, pe: 22.7, divYield: 0.0307, beta: 0.50, earningsGrowth: -0.04, revenueGrowth: 0.07, profitMargin: 0.169, high52: 168.85, low52: 143.13, avgVolume: 7_200_000 },

  // Consumer
  { symbol: "WMT",  name: "Walmart Inc.",                asset: "equity", sector: "Consumer Defensive",     exchange: "NYSE",   basePrice: 81.27,  vol: 0.18, marketCap: 654_000_000_000, pe: 41.4, divYield: 0.0103, beta: 0.51, earningsGrowth: 0.20, revenueGrowth: 0.05, profitMargin: 0.027, high52: 84.06,  low52: 49.85,  avgVolume: 21_000_000 },
  { symbol: "COST", name: "Costco Wholesale",            asset: "equity", sector: "Consumer Defensive",     exchange: "NASDAQ", basePrice: 905.29, vol: 0.21, marketCap: 401_000_000_000, pe: 56.5, divYield: 0.0050, beta: 0.78, earningsGrowth: 0.13, revenueGrowth: 0.07, profitMargin: 0.029, high52: 923.83, low52: 610.94, avgVolume: 1_700_000 },
  { symbol: "MCD",  name: "McDonald's Corporation",      asset: "equity", sector: "Consumer Cyclical",      exchange: "NYSE",   basePrice: 305.14, vol: 0.17, marketCap: 219_000_000_000, pe: 26.4, divYield: 0.0238, beta: 0.57, earningsGrowth: 0.01, revenueGrowth: 0.02, profitMargin: 0.319, high52: 320.51, low52: 243.53, avgVolume: 3_000_000 },

  // Energy
  { symbol: "XOM",  name: "Exxon Mobil Corporation",     asset: "equity", sector: "Energy",                 exchange: "NYSE",   basePrice: 117.36, vol: 0.26, marketCap: 521_000_000_000, pe: 14.3, divYield: 0.0327, beta: 0.85, earningsGrowth: -0.05, revenueGrowth: 0.06, profitMargin: 0.107, high52: 126.34, low52: 95.77,  avgVolume: 14_000_000 },
  { symbol: "CVX",  name: "Chevron Corporation",         asset: "equity", sector: "Energy",                 exchange: "NYSE",   basePrice: 154.12, vol: 0.25, marketCap: 282_000_000_000, pe: 14.8, divYield: 0.0431, beta: 1.14, earningsGrowth: -0.27, revenueGrowth: -0.02, profitMargin: 0.087, high52: 169.29, low52: 134.16, avgVolume: 8_000_000 },

  // Industrials & misc
  { symbol: "BA",   name: "The Boeing Company",          asset: "equity", sector: "Industrials",            exchange: "NYSE",   basePrice: 161.94, vol: 0.45, marketCap: 100_000_000_000, pe: -38.0, beta: 1.55, earningsGrowth: -2.1, revenueGrowth: -0.07, profitMargin: -0.05, high52: 267.54, low52: 137.03, avgVolume: 9_500_000 },
  { symbol: "DIS",  name: "The Walt Disney Company",     asset: "equity", sector: "Communication Services", exchange: "NYSE",   basePrice: 95.36,  vol: 0.30, marketCap: 173_000_000_000, pe: 33.5, divYield: 0.0094, beta: 1.36, earningsGrowth: 0.30, revenueGrowth: 0.03, profitMargin: 0.058, high52: 123.74, low52: 83.91,  avgVolume: 9_300_000 },
  { symbol: "PLTR", name: "Palantir Technologies",       asset: "equity", sector: "Technology",             exchange: "NYSE",   basePrice: 41.24,  vol: 0.62, marketCap: 91_000_000_000, pe: 175.1, pegRatio: 5.5, beta: 2.49, earningsGrowth: 0.91, revenueGrowth: 0.27, profitMargin: 0.156, high52: 45.82,  low52: 16.20,  avgVolume: 73_000_000 },
  { symbol: "COIN", name: "Coinbase Global Inc.",        asset: "equity", sector: "Financial Services",     exchange: "NASDAQ", basePrice: 178.32, vol: 0.78, marketCap: 44_000_000_000,  pe: 31.4, beta: 3.17, earningsGrowth: 1.92, revenueGrowth: 1.05, profitMargin: 0.259, high52: 283.48, low52: 79.30,  avgVolume: 9_300_000 },
  { symbol: "SHOP", name: "Shopify Inc.",                asset: "equity", sector: "Technology",             exchange: "NYSE",   basePrice: 76.42,  vol: 0.50, marketCap: 99_000_000_000, pe: 64.0, pegRatio: 2.4, beta: 2.06, earningsGrowth: 0.32, revenueGrowth: 0.21, profitMargin: 0.073, high52: 91.57,  low52: 48.56,  avgVolume: 9_400_000 },
  { symbol: "UBER", name: "Uber Technologies Inc.",      asset: "equity", sector: "Technology",             exchange: "NYSE",   basePrice: 73.41,  vol: 0.36, marketCap: 153_000_000_000, pe: 87.4, pegRatio: 1.1, beta: 1.32, earningsGrowth: 1.22, revenueGrowth: 0.16, profitMargin: 0.080, high52: 87.00,  low52: 54.84,  avgVolume: 22_000_000 },
  { symbol: "PYPL", name: "PayPal Holdings Inc.",        asset: "equity", sector: "Financial Services",     exchange: "NASDAQ", basePrice: 80.93,  vol: 0.34, marketCap: 81_000_000_000, pe: 18.6, beta: 1.43, earningsGrowth: 0.21, revenueGrowth: 0.08, profitMargin: 0.144, high52: 88.27,  low52: 55.85,  avgVolume: 12_000_000 },

  // ETFs and indices
  { symbol: "SPY",  name: "SPDR S&P 500 ETF Trust",      asset: "etf",   exchange: "NYSE",   basePrice: 583.48, vol: 0.13, divYield: 0.0123, beta: 1.0,  avgVolume: 50_000_000 },
  { symbol: "QQQ",  name: "Invesco QQQ Trust",           asset: "etf",   exchange: "NASDAQ", basePrice: 502.30, vol: 0.18, divYield: 0.0061, beta: 1.13, avgVolume: 38_000_000 },
  { symbol: "IWM",  name: "iShares Russell 2000 ETF",    asset: "etf",   exchange: "NYSE",   basePrice: 222.74, vol: 0.20, divYield: 0.0147, beta: 1.18, avgVolume: 27_000_000 },
  { symbol: "DIA",  name: "SPDR Dow Jones Industrial",   asset: "etf",   exchange: "NYSE",   basePrice: 425.76, vol: 0.13, divYield: 0.0167, beta: 0.99, avgVolume: 4_000_000 },
  { symbol: "VTI",  name: "Vanguard Total Stock Market", asset: "etf",   exchange: "NYSE",   basePrice: 290.83, vol: 0.13, divYield: 0.0135, beta: 1.0,  avgVolume: 4_000_000 },

  // Indices (no real ETF — for the macro dashboard)
  { symbol: "SPX",  name: "S&P 500 Index",               asset: "index",  basePrice: 5832.92, vol: 0.13 },
  { symbol: "NDX",  name: "Nasdaq 100 Index",            asset: "index",  basePrice: 20492.10, vol: 0.18 },
  { symbol: "DJI",  name: "Dow Jones Industrial Avg",    asset: "index",  basePrice: 42587.34, vol: 0.12 },
  { symbol: "RUT",  name: "Russell 2000 Index",          asset: "index",  basePrice: 2228.77, vol: 0.20 },
  { symbol: "VIX",  name: "CBOE Volatility Index",       asset: "index",  basePrice: 15.32, vol: 1.10 },

  // Crypto
  { symbol: "BTC",  name: "Bitcoin",                     asset: "crypto", basePrice: 67_482.50, vol: 0.55 },
  { symbol: "ETH",  name: "Ethereum",                    asset: "crypto", basePrice: 2_589.10,  vol: 0.65 },
  { symbol: "SOL",  name: "Solana",                      asset: "crypto", basePrice: 158.42,    vol: 0.85 },
  { symbol: "XRP",  name: "XRP",                         asset: "crypto", basePrice: 0.5418,    vol: 0.78 },
  { symbol: "DOGE", name: "Dogecoin",                    asset: "crypto", basePrice: 0.1295,    vol: 0.95 },
  { symbol: "AVAX", name: "Avalanche",                   asset: "crypto", basePrice: 26.84,     vol: 0.90 },

  // FX
  { symbol: "DXY",     name: "US Dollar Index",          asset: "fx",     basePrice: 103.42, vol: 0.07 },
  { symbol: "EURUSD",  name: "Euro / US Dollar",         asset: "fx",     basePrice: 1.0875, vol: 0.07 },
  { symbol: "GBPUSD",  name: "British Pound / US Dollar",asset: "fx",     basePrice: 1.3092, vol: 0.08 },
  { symbol: "USDJPY",  name: "US Dollar / Japanese Yen", asset: "fx",     basePrice: 149.85, vol: 0.09 },

  // Commodities
  { symbol: "GC",   name: "Gold Futures",                asset: "commodity", basePrice: 2_711.40, vol: 0.16 },
  { symbol: "CL",   name: "WTI Crude Oil Futures",       asset: "commodity", basePrice: 71.78,    vol: 0.36 },
  { symbol: "NG",   name: "Natural Gas Futures",         asset: "commodity", basePrice: 2.594,    vol: 0.55 },
  { symbol: "SI",   name: "Silver Futures",              asset: "commodity", basePrice: 32.18,    vol: 0.30 },

  // Treasuries (yields, not prices — vol is bps drift)
  { symbol: "US2Y", name: "US 2-Year Treasury Yield",    asset: "rate",   basePrice: 4.058, vol: 0.04 },
  { symbol: "US10Y",name: "US 10-Year Treasury Yield",   asset: "rate",   basePrice: 4.231, vol: 0.05 },
  { symbol: "US30Y",name: "US 30-Year Treasury Yield",   asset: "rate",   basePrice: 4.427, vol: 0.05 }
];

export const INSTRUMENT_MAP: Record<string, Instrument> = Object.fromEntries(
  INSTRUMENTS.map((i) => [i.symbol, i])
);

export function getInstrument(sym: string): Instrument | undefined {
  return INSTRUMENT_MAP[sym.toUpperCase()];
}

export function searchInstruments(q: string, limit = 12): Instrument[] {
  const s = q.trim().toUpperCase();
  if (!s) return [];
  const exact = INSTRUMENTS.filter((i) => i.symbol === s);
  const starts = INSTRUMENTS.filter((i) => i.symbol !== s && i.symbol.startsWith(s));
  const contains = INSTRUMENTS.filter(
    (i) => !i.symbol.startsWith(s) && (i.symbol.includes(s) || i.name.toUpperCase().includes(s))
  );
  return [...exact, ...starts, ...contains].slice(0, limit);
}

export const SECTORS = [
  "Technology",
  "Communication Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Healthcare",
  "Financial Services",
  "Industrials",
  "Energy",
  "Utilities",
  "Materials",
  "Real Estate"
] as const;
