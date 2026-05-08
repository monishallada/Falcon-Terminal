import { nanoid } from "nanoid";
import { INSTRUMENTS, getInstrument } from "./instruments";
import { NewsItem, OptionsTrade, SocialPost } from "./types";

const SOURCES = ["Reuters", "Bloomberg", "AP Finance", "CNBC", "WSJ", "Barron's", "Seeking Alpha", "FT", "MarketWatch", "Yahoo Finance"];

const HEADLINES_BULL: ((sym: string, name: string) => string)[] = [
  (s, n) => `${n} beats Q3 EPS estimates, raises full-year guidance`,
  (s, n) => `${n} announces new $20B share buyback program`,
  (s, n) => `Analysts at Morgan Stanley upgrade ${s} to Overweight, PT raised`,
  (s, n) => `${n} signs landmark partnership; shares surge in pre-market`,
  (s, n) => `${s} institutional ownership climbs as funds rotate into name`,
  (s, n) => `${n} unveils next-gen product line at investor day`,
  (s, n) => `${s} options activity skewed bullish — call volume 3.2x normal`,
  (s, n) => `${n} secures multi-year contract worth $4.5B`,
  (s, n) => `Bullish Q4 outlook from ${n} sends peers higher`,
  (s, n) => `${n} reports record revenue; CEO calls AI demand 'unprecedented'`
];

const HEADLINES_BEAR: ((sym: string, name: string) => string)[] = [
  (s, n) => `${n} misses revenue forecast; cuts FY outlook`,
  (s, n) => `${s} downgraded to Underperform on margin concerns`,
  (s, n) => `Insider selling at ${n} reaches highest level in two years`,
  (s, n) => `${n} faces FTC inquiry over recent acquisition`,
  (s, n) => `${s} short interest climbs to 18% of float`,
  (s, n) => `${n} CFO departure raises governance questions`,
  (s, n) => `Supply chain headwinds hit ${n} ahead of holiday quarter`,
  (s, n) => `${s} put-to-call ratio spikes; institutions hedging`,
  (s, n) => `Class action lawsuit filed against ${n} over disclosures`,
  (s, n) => `${n} guides Q4 below consensus — pre-market down sharply`
];

const HEADLINES_NEUT: ((sym: string, name: string) => string)[] = [
  (s, n) => `${n} files updated 10-Q with the SEC`,
  (s, n) => `${n} CFO to speak at upcoming Goldman Sachs conference`,
  (s, n) => `${s} added to S&P 500 Equal Weight Index`,
  (s, n) => `${n} announces management reshuffle ahead of fiscal year-end`,
  (s, n) => `Analyst day scheduled for ${n} — focus on AI roadmap expected`
];

const MACRO_HEADLINES = [
  "FOMC minutes signal members divided on December rate path",
  "CPI prints in line with consensus; core slightly cooler than expected",
  "10-year Treasury yield slips to 4.18% on bid for duration",
  "ISM Manufacturing PMI returns to expansion territory",
  "Initial jobless claims tick higher; labor market shows signs of softening",
  "ECB holds rates steady; Lagarde reiterates data-dependent approach",
  "China stimulus package boosts global risk sentiment",
  "Oil rallies after OPEC+ extends output cuts through Q1",
  "Dollar index slips to two-week low amid rate cut bets",
  "Bitcoin reclaims $68k as crypto ETF flows turn positive"
];

let counter = 0;
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function jitter(ms: number) {
  return Math.floor(Math.random() * ms);
}

export function generateNewsBatch(n: number): NewsItem[] {
  const out: NewsItem[] = [];
  const equities = INSTRUMENTS.filter((i) => i.asset === "equity");
  const now = Date.now();
  for (let k = 0; k < n; k++) {
    const isMacro = Math.random() < 0.18;
    const ts = now - jitter(60 * 60 * 1000 * 6) - k * 30_000;
    if (isMacro) {
      const head = pick(MACRO_HEADLINES);
      out.push({
        id: nanoid(8),
        ts,
        source: pick(SOURCES),
        headline: head,
        summary: macroSummary(head),
        symbols: ["SPX", "DXY", "US10Y"].slice(0, 1 + Math.floor(Math.random() * 3)),
        sentiment: (Math.random() - 0.5) * 1.4,
        urgency: Math.random() < 0.15 ? "breaking" : "standard"
      });
      continue;
    }
    const inst = pick(equities);
    const dir = Math.random();
    let headline: string;
    let sentiment: number;
    if (dir < 0.42) {
      headline = pick(HEADLINES_BULL)(inst.symbol, inst.name);
      sentiment = 0.35 + Math.random() * 0.6;
    } else if (dir < 0.78) {
      headline = pick(HEADLINES_BEAR)(inst.symbol, inst.name);
      sentiment = -(0.35 + Math.random() * 0.6);
    } else {
      headline = pick(HEADLINES_NEUT)(inst.symbol, inst.name);
      sentiment = (Math.random() - 0.5) * 0.4;
    }
    out.push({
      id: nanoid(8) + "-" + counter++,
      ts,
      source: pick(SOURCES),
      headline,
      summary: stockSummary(inst.symbol, inst.name, sentiment),
      symbols: [inst.symbol],
      sentiment,
      urgency: Math.abs(sentiment) > 0.7 && Math.random() < 0.3 ? "breaking" : "standard"
    });
  }
  return out.sort((a, b) => b.ts - a.ts);
}

function stockSummary(sym: string, name: string, s: number) {
  if (s > 0.4) return `${name} ${sym} caught a bid after the headline; analysts cite improving fundamentals and a constructive setup heading into year-end. The Street expects a continuation of recent operating momentum.`;
  if (s < -0.4) return `${name} ${sym} came under pressure as investors digest the news. Risk officers are reviewing exposure; technicals suggest the prior support level is being tested.`;
  return `${name} ${sym} traded with mixed reaction. The disclosure is largely procedural and is unlikely to alter the medium-term thesis materially.`;
}
function macroSummary(h: string) {
  return `${h.split(",")[0]}. Cross-asset markets are recalibrating positioning into the close, with rate-sensitive sectors leading the move.`;
}

// Streaming: emit a new item every few seconds, as if a wire is firing.
export class NewsStream {
  private subs: Set<(item: NewsItem) => void> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const next = generateNewsBatch(1)[0];
      next.ts = Date.now();
      this.subs.forEach((s) => s(next));
    }, 8000 + Math.random() * 8000);
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  subscribe(fn: (item: NewsItem) => void) {
    this.subs.add(fn);
    if (!this.timer) this.start();
    return () => { this.subs.delete(fn); };
  }
}

let _stream: NewsStream | null = null;
export function getNewsStream(): NewsStream {
  if (!_stream) _stream = new NewsStream();
  return _stream;
}

// ---- Options flow ----

export function generateOptionsTrades(n: number): OptionsTrade[] {
  const equities = INSTRUMENTS.filter((i) => i.asset === "equity" || i.asset === "etf");
  const out: OptionsTrade[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const inst = pick(equities);
    const side: "call" | "put" = Math.random() < 0.55 ? "call" : "put";
    const spot = inst.basePrice * (1 + (Math.random() - 0.5) * 0.01);
    const strikeOffset = (Math.random() - 0.5) * 0.16; // ±16% from spot
    const strike = roundStrike(spot * (1 + strikeOffset), spot);
    const dte = pick([1, 3, 7, 14, 21, 30, 45, 60, 90, 120]);
    const expiry = new Date(now + dte * 86400000).toISOString().slice(0, 10);
    const size = 10 + Math.floor(Math.pow(Math.random(), 3) * 5000); // skew toward small, occasional whales
    const iv = 0.25 + Math.random() * 0.7;
    const t = dte / 365;
    // Black-Scholes-ish premium
    const moneyness = side === "call" ? Math.max(0, spot - strike) : Math.max(0, strike - spot);
    const tv = spot * iv * Math.sqrt(t) * 0.4;
    const price = Math.max(0.05, moneyness + tv);
    const premium = price * size * 100;
    const unusual = premium > 750_000 || size > 2500;
    out.push({
      id: nanoid(8),
      ts: now - i * (1000 + Math.random() * 6000),
      symbol: inst.symbol,
      side,
      strike,
      expiry,
      size,
      price: round2(price),
      premium,
      spotAtTrade: round2(spot),
      unusual,
      sweep: unusual && Math.random() < 0.45,
      sentiment: side === "call" ? "bullish" : "bearish"
    });
  }
  return out.sort((a, b) => b.ts - a.ts);
}
function roundStrike(s: number, ref: number) {
  if (ref < 5) return Math.round(s * 2) / 2;
  if (ref < 25) return Math.round(s);
  if (ref < 100) return Math.round(s / 2.5) * 2.5;
  if (ref < 500) return Math.round(s / 5) * 5;
  return Math.round(s / 10) * 10;
}
function round2(v: number) {
  return Math.round(v * 100) / 100;
}

// ---- Social posts ----
const HANDLES = [
  "@momentum_quant", "@OptionsFlowDaily", "@WallStreetWidow", "@trader_lex",
  "@TheChartGuy", "@macro_sage", "@rektpilled", "@AlphaBetaSoup",
  "@DegenWizard", "@FedWatcher", "@VolPanda", "@DiamondHandsCEO"
];
const TEMPLATES_BULL = [
  "I'm long $SYM into earnings — call premium burning, name still cheap",
  "$SYM tape looks heavy on the bid all morning. Smart money loading",
  "$SYM crosses key resistance at the 200DMA. Don't fade strength here",
  "Adding to my $SYM position. Multi-year breakout setup intact",
  "Calls at the $STK strike on $SYM lighting up. Watch this name today"
];
const TEMPLATES_BEAR = [
  "$SYM looks heavy here, distribution candle into a wall of supply",
  "Cutting my $SYM long. Risk-reward isn't there with the rates move",
  "$SYM flagging short — dealer gamma is negative under spot",
  "Big block of $SYM puts just printed. Someone knows something",
  "Bear flag forming on $SYM 4H. I'd be cautious chasing rallies"
];
const TEMPLATES_NEUT = [
  "$SYM pinning the $STK strike into expiry. Vanna effect in play",
  "Anyone seeing the same $SYM order flow as me? Confirms my thesis",
  "$SYM consolidation could resolve either way — wait for the break"
];

export function generateSocialPosts(n: number): SocialPost[] {
  const out: SocialPost[] = [];
  const now = Date.now();
  const equities = INSTRUMENTS.filter((i) => i.asset === "equity");
  for (let i = 0; i < n; i++) {
    const inst = pick(equities);
    const r = Math.random();
    let body: string;
    let sentiment: number;
    if (r < 0.45) {
      body = pick(TEMPLATES_BULL);
      sentiment = 0.4 + Math.random() * 0.55;
    } else if (r < 0.85) {
      body = pick(TEMPLATES_BEAR);
      sentiment = -(0.4 + Math.random() * 0.55);
    } else {
      body = pick(TEMPLATES_NEUT);
      sentiment = (Math.random() - 0.5) * 0.3;
    }
    const strike = Math.round(inst.basePrice * (1 + (Math.random() - 0.5) * 0.06));
    body = body.replace(/\$SYM/g, "$" + inst.symbol).replace(/\$STK/g, "$" + strike);
    out.push({
      id: nanoid(8),
      ts: now - i * (10_000 + Math.random() * 60_000),
      platform: pick(["stocktwits", "reddit", "x"] as const),
      author: pick(HANDLES),
      body,
      symbols: [inst.symbol],
      sentiment,
      likes: Math.floor(Math.random() * 1200)
    });
  }
  return out.sort((a, b) => b.ts - a.ts);
}

// ---- Sentiment aggregate ----
export function sentimentSummary(symbol: string, posts: SocialPost[]) {
  const now = Date.now();
  const win1h = posts.filter((p) => p.symbols.includes(symbol) && now - p.ts < 3600 * 1000);
  const win24h = posts.filter((p) => p.symbols.includes(symbol) && now - p.ts < 86400 * 1000);
  const score =
    win24h.length === 0
      ? 0
      : win24h.reduce((a, b) => a + b.sentiment, 0) / win24h.length;
  return {
    score,                             // -1..1
    mentions1h: win1h.length,
    mentions24h: win24h.length,
    velocity: win1h.length / Math.max(1, win24h.length / 24)
  };
}

// Earnings calendar — synthetic but plausible
export function earningsCalendar() {
  const equities = INSTRUMENTS.filter((i) => i.asset === "equity");
  const out = equities.map((inst, i) => {
    const days = (i % 14) + 1;
    const date = new Date(Date.now() + days * 86400000);
    return {
      symbol: inst.symbol,
      name: inst.name,
      date: date.toISOString().slice(0, 10),
      time: i % 2 === 0 ? "BMO" : "AMC",
      epsEstimate: round2((inst.pe ? inst.basePrice / inst.pe / 4 : 1) * (0.8 + Math.random() * 0.4)),
      revEstimate: (inst.marketCap || 1e10) * 0.001 * (0.7 + Math.random() * 0.6)
    };
  });
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// Macro calendar — major US macro releases
export const MACRO_CALENDAR = [
  { date: "T+1", time: "08:30 ET", event: "Initial Jobless Claims", prior: "224K", consensus: "230K", impact: "med" },
  { date: "T+2", time: "08:30 ET", event: "CPI YoY", prior: "2.6%", consensus: "2.5%", impact: "high" },
  { date: "T+3", time: "10:00 ET", event: "Existing Home Sales", prior: "3.96M", consensus: "3.92M", impact: "med" },
  { date: "T+5", time: "14:00 ET", event: "FOMC Meeting Minutes", prior: "—", consensus: "—", impact: "high" },
  { date: "T+7", time: "08:30 ET", event: "Retail Sales MoM", prior: "0.4%", consensus: "0.3%", impact: "high" },
  { date: "T+9", time: "08:30 ET", event: "PPI YoY", prior: "1.8%", consensus: "1.9%", impact: "med" },
  { date: "T+12", time: "10:00 ET", event: "ISM Manufacturing PMI", prior: "47.2", consensus: "47.6", impact: "med" },
  { date: "T+14", time: "08:30 ET", event: "Nonfarm Payrolls", prior: "254K", consensus: "180K", impact: "high" }
];

// Provided to keep imports tidy
export { getInstrument };
