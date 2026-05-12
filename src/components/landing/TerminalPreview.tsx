"use client";
import { Reveal } from "./Reveal";
import Link from "next/link";
import {
  CandlestickChart,
  Eye,
  Newspaper,
  Sparkles,
  Briefcase,
  Zap,
  Activity,
  ArrowRight
} from "lucide-react";

/**
 * Static visual mockup of the Falcon terminal — a stylized workspace shown
 * inside a "browser window" frame. Mirrors the real /terminal aesthetic
 * (dark panels, gold-amber accents, monospace numerics) without mounting
 * any of the heavy widgets, so the marketing page stays cheap to render.
 */
export function TerminalPreview() {
  return (
    <section className="relative pt-6 pb-20 sm:pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <Reveal className="mb-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="block w-8 h-px bg-falcon-gold/70" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-falcon-gold">
                  The workspace
                </span>
              </div>
              <h2
                className="font-display font-medium text-white tracking-[-0.015em] leading-[1.05] max-w-3xl"
                style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
              >
                Your research stack, in one window.
              </h2>
            </div>
            <p className="text-white/65 text-[13.5px] max-w-md leading-[1.6]">
              Drag any panel anywhere. Link them by color. Save the layout.
              Open it on any machine — it&apos;s yours.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <BrowserChrome>
            <Workspace />
          </BrowserChrome>
        </Reveal>

        <div className="mt-10 flex justify-center">
          <Link
            href="/login?mode=signup"
            className="btn-gold inline-flex items-center gap-2 h-11 px-7 rounded-full text-[12px] uppercase"
          >
            Build your workspace <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl bg-bg-1 border border-white/8 overflow-hidden"
      style={{
        boxShadow:
          "0 50px 120px -30px rgba(240, 193, 75, 0.18), 0 30px 80px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.03)"
      }}
    >
      {/* macOS-style title bar */}
      <div className="flex items-center h-9 px-4 border-b border-white/6 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-auto text-[10px] uppercase tracking-[0.32em] text-white/45 font-mono">
          falcon · trader workspace
        </div>
      </div>
      {children}
    </div>
  );
}

function Workspace() {
  return (
    <div className="relative bg-[#0b0f16] aspect-[16/9] sm:aspect-[16/8] grid grid-cols-12 grid-rows-12 gap-2 p-2">
      {/* Top bar */}
      <div className="col-span-12 row-span-1 rounded-md border border-white/5 bg-black/40 px-3 flex items-center gap-3">
        <span className="text-falcon-gold text-[10.5px] font-display tracking-[0.4em] uppercase">FALCON</span>
        <span className="text-white/60 text-[10px] font-mono uppercase tracking-[0.18em] hidden sm:inline">Trader</span>
        <div className="ml-auto flex items-center gap-3 text-[10px] font-mono text-white/55">
          <span><span className="text-white/40">SPX</span> <span className="text-white">5832.92</span> <span className="text-bull">+0.42%</span></span>
          <span className="hidden md:inline"><span className="text-white/40">NDX</span> <span className="text-white">20492.10</span> <span className="text-bull">+0.61%</span></span>
          <span className="hidden lg:inline"><span className="text-white/40">VIX</span> <span className="text-white">15.32</span> <span className="text-bear">-1.87%</span></span>
          <span className="ml-2 px-2 py-0.5 border border-bull/40 rounded bg-bull/10 text-bull text-[9px] uppercase tracking-[0.3em]">Live</span>
        </div>
      </div>

      {/* Chart panel — top left, big */}
      <Panel className="col-span-7 row-span-7" title="Chart" symbol="NVDA" icon={CandlestickChart}>
        <ChartCanvas />
      </Panel>

      {/* Watchlist — top right */}
      <Panel className="col-span-5 row-span-7" title="Watchlist" icon={Eye}>
        <WatchlistRows />
      </Panel>

      {/* News */}
      <Panel className="col-span-4 row-span-4" title="News" icon={Newspaper}>
        <NewsRows />
      </Panel>

      {/* AI chat */}
      <Panel className="col-span-4 row-span-4" title="AI Research" icon={Sparkles} accent>
        <AIChat />
      </Panel>

      {/* Options flow */}
      <Panel className="col-span-4 row-span-4" title="Options Flow" icon={Zap}>
        <OptionsRows />
      </Panel>
    </div>
  );
}

interface PanelProps {
  children: React.ReactNode;
  title: string;
  symbol?: string;
  className?: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  accent?: boolean;
}
function Panel({ children, title, symbol, className, icon: Icon, accent }: PanelProps) {
  return (
    <div
      className={
        "rounded-md border bg-black/40 overflow-hidden flex flex-col " +
        (accent ? "border-falcon-gold/30 " : "border-white/6 ") +
        (className ?? "")
      }
    >
      <div className="h-6 px-2 flex items-center gap-1.5 border-b border-white/5 bg-white/[0.02]">
        <Icon size={10} className="text-falcon-gold" />
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white">
          {title}
        </span>
        {symbol && (
          <span className="text-[9.5px] font-mono text-falcon-gold ml-1">{symbol}</span>
        )}
        <div className="ml-auto flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

// ---- Mock chart canvas ----
function ChartCanvas() {
  // Pre-generated mock candle path — enough variation to read as a real chart
  const candles = useMockCandles();
  return (
    <div className="relative h-full w-full p-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2">
        <div className="flex border border-white/8 rounded overflow-hidden">
          {["1m", "5m", "15m", "1h", "4h", "1D"].map((t, i) => (
            <span
              key={t}
              className={
                "px-1.5 py-0.5 text-[8.5px] font-mono " +
                (i === 1 ? "bg-falcon-gold/15 text-falcon-gold" : "text-white/55")
              }
            >
              {t}
            </span>
          ))}
        </div>
        <div className="ml-auto flex gap-2 text-[8.5px] font-mono text-white/55">
          <span>O <span className="text-white">137.20</span></span>
          <span>H <span className="text-white">139.41</span></span>
          <span>L <span className="text-white">136.85</span></span>
          <span>C <span className="text-bull">138.92</span></span>
        </div>
      </div>
      {/* SVG chart */}
      <div className="relative h-[calc(100%-1.5rem)]">
        <svg viewBox="0 0 600 240" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {/* gridlines */}
          {[40, 80, 120, 160, 200].map((y) => (
            <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          {/* EMA-like trend line */}
          <path
            d={candles.ema}
            fill="none"
            stroke="rgba(34, 211, 238, 0.55)"
            strokeWidth="1.4"
          />
          {/* Candles */}
          {candles.list.map((c, i) => (
            <g key={i}>
              <line x1={c.x} x2={c.x} y1={c.low} y2={c.high} stroke={c.up ? "#16c784" : "#ea3943"} strokeWidth="1" />
              <rect
                x={c.x - c.w / 2}
                y={c.bodyTop}
                width={c.w}
                height={Math.max(1, c.bodyH)}
                fill={c.up ? "#16c784" : "#ea3943"}
              />
            </g>
          ))}
          {/* current price line */}
          <line x1="0" y1="74" x2="600" y2="74" stroke="rgba(240,193,75,0.5)" strokeWidth="0.8" strokeDasharray="3 4" />
          <rect x="568" y="68" width="32" height="12" fill="#ffb020" />
          <text x="584" y="77" fontSize="9" fontFamily="monospace" textAnchor="middle" fill="#0b0f16" fontWeight="600">138.92</text>
        </svg>
        {/* Volume row at bottom */}
        <svg viewBox="0 0 600 30" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-6 w-full">
          {candles.list.map((c, i) => (
            <rect
              key={i}
              x={c.x - c.w / 2}
              y={c.volY}
              width={c.w}
              height={c.volH}
              fill={c.up ? "rgba(22,199,132,0.45)" : "rgba(234,57,67,0.45)"}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function useMockCandles() {
  // Deterministic mock candles so SSR matches client (no hydration noise)
  const N = 64;
  const list: {
    x: number; w: number; high: number; low: number; bodyTop: number; bodyH: number;
    up: boolean; volY: number; volH: number;
  }[] = [];
  let s = 0xfa1c0001;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let price = 130;
  const xStep = 600 / N;
  const w = xStep * 0.6;
  const emaPts: { x: number; y: number }[] = [];
  let ema = price;
  for (let i = 0; i < N; i++) {
    const drift = (rnd() - 0.45) * 1.6;
    const open = price;
    const close = open + drift;
    const high = Math.max(open, close) + rnd() * 0.8;
    const low = Math.min(open, close) - rnd() * 0.8;
    price = close;
    // map prices [125 .. 145] -> y [220 .. 20]
    const yFor = (p: number) => 220 - ((p - 125) / 20) * 200;
    const up = close >= open;
    const bodyTop = yFor(Math.max(open, close));
    const bodyH = Math.abs(yFor(open) - yFor(close));
    const x = i * xStep + xStep / 2;
    list.push({
      x, w,
      high: yFor(high),
      low: yFor(low),
      bodyTop, bodyH,
      up,
      volY: 30 - (rnd() * 22 + 4),
      volH: rnd() * 22 + 4
    });
    ema = ema * 0.78 + close * 0.22;
    emaPts.push({ x, y: yFor(ema) });
  }
  const emaPath = emaPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return { list, ema: emaPath };
}

// ---- Watchlist mock ----
function WatchlistRows() {
  const rows = [
    { sym: "NVDA", name: "NVIDIA Corp",      px: "138.92", chg: "+1.42%", up: true },
    { sym: "AAPL", name: "Apple Inc.",       px: "224.31", chg: "-0.31%", up: false },
    { sym: "MSFT", name: "Microsoft",        px: "416.42", chg: "+0.62%", up: true },
    { sym: "GOOGL",name: "Alphabet",         px: "165.29", chg: "+0.18%", up: true },
    { sym: "META", name: "Meta Platforms",   px: "596.45", chg: "+1.04%", up: true },
    { sym: "AMZN", name: "Amazon.com",       px: "195.21", chg: "-0.46%", up: false },
    { sym: "TSLA", name: "Tesla",            px: "248.13", chg: "+2.18%", up: true },
    { sym: "AMD",  name: "Advanced Micro",   px: "144.92", chg: "-0.92%", up: false },
    { sym: "BTC",  name: "Bitcoin",          px: "67,482", chg: "+1.81%", up: true },
    { sym: "ETH",  name: "Ethereum",         px: "2,589",  chg: "+0.55%", up: true }
  ];
  return (
    <div className="h-full overflow-hidden">
      <table className="w-full text-[9.5px] font-mono">
        <thead className="text-white/45 uppercase text-[8.5px] tracking-wider">
          <tr className="border-b border-white/5">
            <th className="text-left px-2 py-1 font-medium">Symbol</th>
            <th className="text-right px-2 py-1 font-medium">Last</th>
            <th className="text-right px-2 py-1 font-medium">Chg%</th>
            <th className="text-right px-2 py-1 font-medium hidden md:table-cell">Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sym} className="border-b border-white/5">
              <td className="px-2 py-1">
                <div className="text-white">{r.sym}</div>
                <div className="text-white/45 text-[8px]">{r.name}</div>
              </td>
              <td className="text-right px-2 py-1 text-white">{r.px}</td>
              <td className={"text-right px-2 py-1 " + (r.up ? "text-bull" : "text-bear")}>{r.chg}</td>
              <td className="text-right px-2 py-1 hidden md:table-cell">
                <svg width="50" height="14" viewBox="0 0 50 14">
                  <path
                    d={r.up
                      ? "M0,10 Q10,8 16,7 T28,5 T40,3 T50,1"
                      : "M0,3 Q10,5 16,7 T28,9 T40,11 T50,12"}
                    fill="none"
                    stroke={r.up ? "#16c784" : "#ea3943"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- News mock ----
function NewsRows() {
  const items = [
    { src: "Reuters",  time: "09:42", head: "NVIDIA secures multi-year contract with hyperscaler", sentiment: "bull" as const },
    { src: "Bloomberg",time: "09:31", head: "Fed minutes: members divided on December path",       sentiment: "neutral" as const },
    { src: "WSJ",      time: "09:18", head: "AAPL ships record holiday quarter, raises guidance",   sentiment: "bull" as const },
    { src: "FT",       time: "08:54", head: "Boeing 737 MAX inquiry widens; shares slip pre-mkt",   sentiment: "bear" as const }
  ];
  return (
    <div className="h-full overflow-hidden">
      {items.map((n, i) => (
        <div key={i} className="px-2 py-1.5 border-b border-white/5">
          <div className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-white/45">
            <span>{n.time}</span><span>·</span><span>{n.src}</span>
            <span
              className={
                "ml-auto px-1 rounded text-[7.5px] font-bold " +
                (n.sentiment === "bull" ? "bg-bull/15 text-bull"
                : n.sentiment === "bear" ? "bg-bear/15 text-bear"
                : "bg-white/8 text-white/65")
              }
            >
              {n.sentiment.toUpperCase()}
            </span>
          </div>
          <div className="text-white text-[10px] mt-0.5 leading-snug">{n.head}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Options flow mock ----
function OptionsRows() {
  const rows = [
    { time: "09:41", sym: "NVDA", side: "C" as const, strike: "140", premium: "$2.4M", unusual: true },
    { time: "09:38", sym: "TSLA", side: "P" as const, strike: "240", premium: "$1.1M", unusual: false },
    { time: "09:35", sym: "SPY",  side: "C" as const, strike: "590", premium: "$842K", unusual: false },
    { time: "09:32", sym: "AMD",  side: "P" as const, strike: "140", premium: "$610K", unusual: false },
    { time: "09:28", sym: "AAPL", side: "C" as const, strike: "230", premium: "$1.8M", unusual: true }
  ];
  return (
    <table className="w-full text-[9.5px] font-mono">
      <thead className="text-white/45 uppercase text-[8.5px] tracking-wider">
        <tr className="border-b border-white/5">
          <th className="text-left px-2 py-1">Time</th>
          <th className="text-left px-2 py-1">Sym</th>
          <th className="text-center px-2 py-1">Side</th>
          <th className="text-right px-2 py-1">Strike</th>
          <th className="text-right px-2 py-1">Prem</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={"border-b border-white/5 " + (r.unusual ? "bg-falcon-gold/5" : "")}>
            <td className="px-2 py-1 text-white/60">{r.time}</td>
            <td className="px-2 py-1 text-white">{r.sym}</td>
            <td className={"px-2 py-1 text-center font-bold " + (r.side === "C" ? "text-bull" : "text-bear")}>{r.side}</td>
            <td className="px-2 py-1 text-right text-white">${r.strike}</td>
            <td className={"px-2 py-1 text-right " + (r.unusual ? "text-falcon-gold font-bold" : "text-white/85")}>{r.premium}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---- AI chat mock ----
function AIChat() {
  return (
    <div className="h-full p-2.5 flex flex-col">
      <div className="text-[8.5px] uppercase tracking-[0.2em] text-falcon-gold/85 mb-2">
        Context · $NVDA
      </div>
      <div className="flex-1 space-y-1.5 text-[10px] leading-snug overflow-hidden">
        <div className="rounded-md bg-falcon-gold/10 border border-falcon-gold/25 px-2 py-1 text-white inline-block">
          Why is NVDA up today?
        </div>
        <div className="rounded-md bg-white/[0.04] border border-white/8 px-2 py-1.5 text-white/85">
          Three drivers stand out: a multi-year hyperscaler contract announced
          pre-market, call premium dominating the tape (3.2× normal), and a
          sector-wide tailwind from semis peers.{" "}
          <span className="inline-block w-1.5 h-2.5 bg-falcon-gold align-middle animate-pulse" />
        </div>
      </div>
      <div className="mt-2 h-6 rounded border border-white/8 bg-white/[0.02] flex items-center px-2 text-[9px] text-white/45">
        Ask Falcon AI…
      </div>
    </div>
  );
}
