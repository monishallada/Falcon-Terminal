import { INSTRUMENTS, getInstrument } from "./instruments";
import { Bar, Instrument, Quote, Timeframe } from "./types";

// ---------- Deterministic seeded RNG (mulberry32) ----------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rand: () => number) {
  // Box-Muller
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function symbolSeed(sym: string) {
  let h = 2166136261;
  for (let i = 0; i < sym.length; i++) {
    h = (h ^ sym.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// ---------- Bar generation ----------
const TF_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 60 * 5,
  "15m": 60 * 15,
  "30m": 60 * 30,
  "1h": 60 * 60,
  "4h": 60 * 60 * 4,
  "1D": 60 * 60 * 24,
  "1W": 60 * 60 * 24 * 7,
  "1M": 60 * 60 * 24 * 30
};

export function timeframeSeconds(tf: Timeframe) {
  return TF_SECONDS[tf];
}

/**
 * Generate a deterministic OHLCV history for a symbol+timeframe ending now.
 * The path is path-dependent on the seed so it's reproducible across panels.
 */
export function generateBars(
  symbol: string,
  tf: Timeframe,
  count: number,
  endTimeMs: number = Date.now()
): Bar[] {
  const inst = getInstrument(symbol);
  if (!inst) return [];
  const tfSec = TF_SECONDS[tf];
  const seed = symbolSeed(symbol) ^ (tfSec & 0xffff);
  const rand = mulberry32(seed);

  // sigma per bar = annualized vol scaled by sqrt(T)
  // assume ~252 trading days, ~6.5h per day, ~390 1m bars/day
  const annualSec = 252 * 6.5 * 60 * 60;
  const sigmaBar = inst.vol * Math.sqrt(tfSec / annualSec);
  const driftBar = (0.05 * tfSec) / annualSec; // 5% annualized drift

  // Start a bit below current and walk up to it; for crypto/fx, walk freely
  let price = inst.basePrice * (1 - sigmaBar * Math.sqrt(count) * 0.4);
  const bars: Bar[] = [];

  // Align to the most recent boundary
  const endSec = Math.floor(endTimeMs / 1000);
  const lastBoundary = endSec - (endSec % tfSec);

  // Volume base
  const volBase = inst.avgVolume ? inst.avgVolume / Math.max(1, 78) : 1_000_000; // 78 5m bars per day approx
  const volScale = Math.max(0.05, tfSec / 300);

  for (let i = 0; i < count; i++) {
    const t = lastBoundary - (count - 1 - i) * tfSec;

    // Open is previous close (or starting price)
    const open = i === 0 ? price : bars[i - 1].close;

    // Walk close
    const z = gauss(rand);
    const ret = driftBar + sigmaBar * z;
    let close = open * Math.exp(ret);

    // Within-bar high/low — sample two more shocks
    const hShock = Math.abs(gauss(rand)) * sigmaBar * open;
    const lShock = Math.abs(gauss(rand)) * sigmaBar * open;
    const high = Math.max(open, close) + hShock * 0.6;
    const low = Math.min(open, close) - lShock * 0.6;

    // Volume — gamma-ish via two uniforms
    const vol = Math.round(volBase * volScale * (0.4 + 1.6 * rand()) * (1 + Math.abs(z) * 0.6));

    bars.push({ time: t, open, high, low, close, volume: vol });
    price = close;
  }

  // Pin the final close exactly to base price so the live tick can keep walking from there
  // (only when not pinned by a live update)
  return bars;
}

// ---------- Live streaming engine ----------
type Subscriber = (q: Quote) => void;

class MarketEngine {
  private quotes: Record<string, Quote> = {};
  private subs: Map<string, Set<Subscriber>> = new Map();
  private allSubs: Set<Subscriber> = new Set();
  private rngs: Record<string, () => number> = {};
  private timer: ReturnType<typeof setInterval> | null = null;
  private tickRate = 250; // ms — visible rate of price ticks
  private speed = 1;       // user-controllable speed multiplier

  constructor() {
    INSTRUMENTS.forEach((inst) => this.bootstrap(inst));
  }

  private bootstrap(inst: Instrument) {
    const seed = symbolSeed(inst.symbol) ^ 0x9e3779b9;
    this.rngs[inst.symbol] = mulberry32(seed);
    const open = inst.basePrice * (1 + (this.rngs[inst.symbol]() - 0.5) * 0.005);
    const prev = inst.basePrice * (1 + (this.rngs[inst.symbol]() - 0.5) * 0.02);
    const price = inst.basePrice;
    this.quotes[inst.symbol] = {
      symbol: inst.symbol,
      price,
      prev,
      change: price - prev,
      changePct: (price - prev) / prev,
      bid: price - this.spread(inst) / 2,
      ask: price + this.spread(inst) / 2,
      bidSize: 100 + Math.floor(this.rngs[inst.symbol]() * 1900),
      askSize: 100 + Math.floor(this.rngs[inst.symbol]() * 1900),
      volume: inst.avgVolume ? Math.floor(inst.avgVolume * 0.42) : 100_000,
      high: Math.max(open, price),
      low: Math.min(open, price),
      open,
      ts: Date.now(),
      flash: 0
    };
  }

  private spread(inst: Instrument) {
    if (inst.asset === "crypto") return inst.basePrice * 0.0005;
    if (inst.asset === "fx") return inst.basePrice * 0.0001;
    if (inst.asset === "rate") return 0.001;
    if (inst.asset === "commodity") return inst.basePrice * 0.0008;
    if (inst.asset === "index") return inst.basePrice * 0.0001;
    if (inst.basePrice < 5) return 0.005;
    if (inst.basePrice < 50) return 0.02;
    if (inst.basePrice < 200) return 0.05;
    return 0.1;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), this.tickRate);
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  setSpeed(mult: number) {
    this.speed = Math.max(0, Math.min(20, mult));
  }
  getSpeed() {
    return this.speed;
  }

  subscribe(symbol: string, fn: Subscriber): () => void {
    const key = symbol.toUpperCase();
    if (!this.subs.has(key)) this.subs.set(key, new Set());
    this.subs.get(key)!.add(fn);
    // Send the latest quote immediately
    const q = this.quotes[key];
    if (q) queueMicrotask(() => fn(q));
    return () => this.subs.get(key)?.delete(fn);
  }
  subscribeAll(fn: Subscriber): () => void {
    this.allSubs.add(fn);
    return () => this.allSubs.delete(fn);
  }

  getQuote(symbol: string): Quote | undefined {
    return this.quotes[symbol.toUpperCase()];
  }
  getAllQuotes(): Quote[] {
    return Object.values(this.quotes);
  }

  // Force a quote forward in time — used by replay/seek if needed later
  jolt(symbol: string, delta: number) {
    const q = this.quotes[symbol.toUpperCase()];
    if (!q) return;
    const newPrice = Math.max(0.0001, q.price * (1 + delta));
    this.commit(symbol, newPrice);
  }

  private commit(symbol: string, newPrice: number) {
    const inst = getInstrument(symbol);
    if (!inst) return;
    const q = this.quotes[symbol];
    const prev = q.price;
    q.price = newPrice;
    q.change = newPrice - q.prev;
    q.changePct = q.change / q.prev;
    q.high = Math.max(q.high, newPrice);
    q.low = Math.min(q.low, newPrice);
    const sp = this.spread(inst);
    q.bid = newPrice - sp / 2;
    q.ask = newPrice + sp / 2;
    q.bidSize = 100 + Math.floor(this.rngs[symbol]() * 4900);
    q.askSize = 100 + Math.floor(this.rngs[symbol]() * 4900);
    q.volume += Math.max(0, Math.floor((inst.avgVolume || 200_000) / 23400 * (0.6 + this.rngs[symbol]() * 1.5))); // approx per-second avg
    q.ts = Date.now();
    q.flash = newPrice > prev ? 1 : newPrice < prev ? -1 : 0;
    // Notify
    this.subs.get(symbol)?.forEach((s) => s(q));
    this.allSubs.forEach((s) => s(q));
  }

  private tick() {
    if (this.speed === 0) return;
    // Step every symbol — but the rate of CHANGE is scaled by speed.
    INSTRUMENTS.forEach((inst) => {
      const r = this.rngs[inst.symbol];
      // sigma per tick = annualized vol scaled to tickRate
      const annualSec = 252 * 6.5 * 60 * 60;
      const dt = (this.tickRate / 1000) * this.speed;
      const sigma = inst.vol * Math.sqrt(dt / annualSec);
      const drift = (0.05 * dt) / annualSec;
      const z = gauss(r);
      // Mean-reverting nudge so prices don't run away over a long session
      const q = this.quotes[inst.symbol];
      const reversion = -0.05 * (Math.log(q.price / inst.basePrice));
      const ret = drift + sigma * z + reversion * sigma;
      const next = q.price * Math.exp(ret);
      this.commit(inst.symbol, next);
    });
  }
}

// Singleton — start lazily on first subscription
let _engine: MarketEngine | null = null;
export function getMarket(): MarketEngine {
  if (!_engine) {
    _engine = new MarketEngine();
    if (typeof window !== "undefined") _engine.start();
  }
  return _engine;
}

export function fmtPrice(p: number, asset?: string) {
  if (asset === "fx") return p.toFixed(4);
  if (asset === "rate") return p.toFixed(3) + "%";
  if (asset === "crypto" && p < 1) return p.toFixed(4);
  if (p >= 10000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 100) return p.toFixed(2);
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
}

export function fmtPct(x: number, withSign = true) {
  const v = (x * 100).toFixed(2) + "%";
  if (!withSign) return v;
  return x > 0 ? `+${v}` : v;
}

export function fmtVol(v: number) {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(0);
}

export function fmtMcap(v?: number) {
  if (!v) return "—";
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(0) + "M";
  return v.toLocaleString();
}
