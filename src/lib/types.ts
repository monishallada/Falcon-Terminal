export type AssetClass = "equity" | "etf" | "crypto" | "fx" | "commodity" | "index" | "rate";

export interface Instrument {
  symbol: string;
  name: string;
  asset: AssetClass;
  sector?: string;
  exchange?: string;
  basePrice: number;
  vol: number; // annualized vol used by the simulator
  marketCap?: number; // in USD
  pe?: number;
  pegRatio?: number;
  divYield?: number;
  beta?: number;
  earningsGrowth?: number;
  revenueGrowth?: number;
  profitMargin?: number;
  high52?: number;
  low52?: number;
  avgVolume?: number;
  description?: string;
}

export interface Quote {
  symbol: string;
  price: number;
  prev: number;       // previous close
  change: number;
  changePct: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  ts: number;         // last update epoch ms
  flash?: 1 | -1 | 0; // flash direction for ui
}

export interface Bar {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1D" | "1W" | "1M";

export interface NewsItem {
  id: string;
  ts: number;
  source: string;
  headline: string;
  summary: string;
  symbols: string[];
  sentiment: number; // -1 .. +1
  urgency: "breaking" | "standard";
  url?: string;
}

export interface OptionsTrade {
  id: string;
  ts: number;
  symbol: string;
  side: "call" | "put";
  strike: number;
  expiry: string;
  size: number;
  price: number;
  premium: number;
  spotAtTrade: number;
  unusual: boolean;
  sweep: boolean;
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface SocialPost {
  id: string;
  ts: number;
  platform: "stocktwits" | "reddit" | "x";
  author: string;
  body: string;
  symbols: string[];
  sentiment: number;
  likes: number;
}

export type WidgetType =
  | "chart"
  | "watchlist"
  | "quote"
  | "news"
  | "ai_chat"
  | "portfolio"
  | "screener"
  | "options_flow"
  | "sentiment"
  | "macro"
  | "heatmap"
  | "time_sales"
  | "level2"
  | "tape"
  | "calendar"
  | "notes";

export type ChipColor = "blue" | "yellow" | "red" | "green" | "purple" | "cyan" | "pink" | "gray";

export interface PanelConfig {
  // Per-widget settings — kept as a generic record for extensibility
  symbol?: string;
  timeframe?: Timeframe;
  indicators?: string[];
  filter?: string;
  source?: string;
  [k: string]: unknown;
}

export interface PanelState {
  i: string;       // grid id
  type: WidgetType;
  group: ChipColor | null; // panel-link color group
  config: PanelConfig;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  // react-grid-layout v1 layout — { i, x, y, w, h }
  layout: { i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number }[];
  panels: Record<string, PanelState>;
  version: number;
}

export interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
  purchaseDate: string;
}

export interface AlertRule {
  id: string;
  symbol: string;
  type: "above" | "below" | "pct_up" | "pct_down";
  value: number;
  fired?: boolean;
  ts: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
  streaming?: boolean;
  citations?: { title: string; source: string }[];
}
