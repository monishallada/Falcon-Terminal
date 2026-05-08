"use client";
import {
  CandlestickChart,
  Sparkles,
  Newspaper,
  Briefcase,
  Filter,
  Zap,
  Globe,
  LayoutGrid,
  MessageCircle,
  Layers,
  Tv2,
  CalendarDays,
  Eye,
  StickyNote,
  Activity,
  List
} from "lucide-react";
import { Reveal } from "./Reveal";

type IconType = React.ComponentType<{ size?: number | string; className?: string }>;

const PILLARS: { title: string; body: string; icon: IconType }[] = [
  {
    title: "Modular workspace",
    body:
      "Drag, resize, and link panels into named workspaces that persist across sessions. An OS for investing — every chart, news feed, and AI chat is a window inside it.",
    icon: LayoutGrid
  },
  {
    title: "Real-time, sub-500ms",
    body:
      "A pub-sub fan-out engine streams live ticks for equities, ETFs, crypto, FX, commodities, indices, and treasuries — all in a single workspace.",
    icon: Zap
  },
  {
    title: "AI-native research",
    body:
      "A streaming research engine that synthesizes filings, transcripts, and live data into one answer. Earnings, intraday, comparisons, screens, macro — ask in plain English.",
    icon: Sparkles
  }
];

const WIDGETS: { name: string; description: string; icon: IconType }[] = [
  { name: "Charting",      description: "Candle / line / area, 8 timeframes, EMA, VWAP, Bollinger, MACD.", icon: CandlestickChart },
  { name: "AI Research",   description: "Streaming, citation-aware answers grounded in live data.",        icon: Sparkles },
  { name: "News",          description: "Wires, filings, and macro releases — sentiment-scored.",          icon: Newspaper },
  { name: "Sentiment",     description: "Social mention velocity, bull/bear gauge, trending tickers.",     icon: MessageCircle },
  { name: "Options Flow",  description: "Unusual prints, sweeps, gamma exposure, put/call ratios.",        icon: Zap },
  { name: "Portfolio",     description: "Live P&L, sector allocation, beta, AI-generated commentary.",     icon: Briefcase },
  { name: "Screener",      description: "Filter and rank the universe in milliseconds, save presets.",     icon: Filter },
  { name: "Macro",         description: "Indices, FX, rates, commodities, crypto — one global view.",     icon: Globe },
  { name: "Heatmap",       description: "Sector-grouped, market-cap-weighted heat across the tape.",       icon: LayoutGrid },
  { name: "Watchlist",     description: "Sortable lists with sparkline previews and live ticks.",          icon: Eye },
  { name: "Time & Sales",  description: "Print-by-print tape with aggressor side coloring.",               icon: List },
  { name: "Level II",      description: "Order book depth grouped by market maker.",                       icon: Layers },
  { name: "Tape",          description: "Cross-asset scrolling ticker — your situational radar.",          icon: Tv2 },
  { name: "Calendar",      description: "Earnings + macro releases with prior and consensus.",             icon: CalendarDays },
  { name: "Quote",         description: "One-symbol detail card — bid, ask, range, fundamentals.",         icon: Activity },
  { name: "Notes",         description: "A trade journal embedded in your workspace.",                     icon: StickyNote }
];

export function Features() {
  return (
    <>
      {/* Three pillars */}
      <section id="product" className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <Reveal>
            <SectionLabel>An operating system for investing</SectionLabel>
            <h2 className="mt-6 font-display font-medium text-white text-[clamp(32px,4.6vw,56px)] leading-[1.05] tracking-[-0.015em] max-w-3xl">
              The terminal you couldn&apos;t afford,{" "}
              <span className="text-white/55">reimagined for retail.</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="glass-card rounded-2xl p-7 h-full">
                  <div className="w-10 h-10 rounded-xl bg-falcon-gold/12 border border-falcon-gold/30 flex items-center justify-center mb-5 shadow-[0_0_30px_-8px_rgba(240,193,75,0.5)]">
                    <p.icon size={17} className="text-falcon-gold" />
                  </div>
                  <div className="text-white text-[18px] font-medium mb-2 tracking-tight">{p.title}</div>
                  <div className="text-white/85 text-[14px] leading-[1.65] font-light">{p.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Widget grid */}
      <section id="features" className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <Reveal>
            <SectionLabel>16 native widgets</SectionLabel>
            <h2 className="mt-6 font-display font-medium text-white text-[clamp(28px,4vw,48px)] leading-[1.05] max-w-3xl tracking-[-0.015em]">
              One workspace.{" "}
              <span className="text-white/55">Sixteen ways to read the market.</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {WIDGETS.map((w, i) => (
              <Reveal key={w.name} delay={(i % 8) * 50}>
                <div className="glass-card rounded-xl p-5 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <w.icon size={14} className="text-falcon-gold" />
                    <div className="text-white text-[14px] font-medium tracking-tight">{w.name}</div>
                  </div>
                  <div className="text-white/75 text-[12.5px] leading-[1.6] font-light">
                    {w.description}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="block w-8 h-px bg-falcon-gold/70" />
      <span className="spaced-display text-[10.5px] sm:text-[11px] uppercase tracking-[0.4em] text-falcon-gold">
        {children}
      </span>
    </div>
  );
}
