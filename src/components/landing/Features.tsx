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
  { name: "AI Research",   description: "Streaming, citation-aware answers grounded in live data.", icon: Sparkles },
  { name: "News",          description: "Wire, filings, and macro releases — sentiment-scored, urgency-flagged.", icon: Newspaper },
  { name: "Sentiment",     description: "Social mention velocity, bull/bear gauge, trending tickers.", icon: MessageCircle },
  { name: "Options Flow",  description: "Unusual prints, sweeps, gamma exposure, put/call ratios.", icon: Zap },
  { name: "Portfolio",     description: "Live P&L, sector allocation, beta, AI-generated commentary.", icon: Briefcase },
  { name: "Screener",      description: "Filter and rank the universe in milliseconds, save presets.", icon: Filter },
  { name: "Macro",         description: "Indices, FX, rates, commodities, crypto — one global view.", icon: Globe },
  { name: "Heatmap",       description: "Sector-grouped, market-cap-weighted heat across the tape.", icon: LayoutGrid },
  { name: "Watchlist",     description: "Sortable lists with sparkline previews and live ticks.", icon: Eye },
  { name: "Time & Sales",  description: "Print-by-print tape with aggressor side coloring.", icon: List },
  { name: "Level II",      description: "Order book depth grouped by market maker.", icon: Layers },
  { name: "Tape",          description: "Cross-asset scrolling ticker — your situational radar.", icon: Tv2 },
  { name: "Calendar",      description: "Earnings + macro releases with prior and consensus.", icon: CalendarDays },
  { name: "Quote",         description: "One-symbol detail card — bid, ask, range, fundamentals.", icon: Activity },
  { name: "Notes",         description: "A trade journal embedded in your workspace.", icon: StickyNote }
];

export function Features() {
  return (
    <>
      {/* Three pillars */}
      <section id="product" className="relative py-32 sm:py-44">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <Reveal>
            <SectionLabel>An operating system for investing</SectionLabel>
            <h2 className="mt-8 font-display font-extralight text-white text-[clamp(36px,5.5vw,72px)] leading-[1.05] tracking-[-0.01em] max-w-3xl">
              The terminal you couldn&apos;t afford —
              <br />
              <span className="brand-gradient">reimagined for retail.</span>
            </h2>
            <p className="mt-10 text-white/75 text-[16.5px] sm:text-[18px] leading-[1.85] max-w-2xl font-light">
              Falcon is a single, modular workspace where every panel is a widget — chart, news,
              options flow, AI chat, portfolio. Arrange them once, and they follow you across
              devices.
            </p>
          </Reveal>

          <div className="mt-24 grid md:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 110}>
                <div className="glass-card rounded-2xl p-8 h-full">
                  <div className="w-11 h-11 rounded-xl bg-falcon-gold/12 border border-falcon-gold/30 flex items-center justify-center mb-6 shadow-[0_0_30px_-8px_rgba(240,193,75,0.5)]">
                    <p.icon size={19} className="text-falcon-gold" />
                  </div>
                  <div className="text-white text-[19px] font-medium mb-3 tracking-tight">{p.title}</div>
                  <div className="text-white/70 text-[14.5px] leading-[1.75] font-light">{p.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Widget grid */}
      <section id="features" className="relative py-32 sm:py-40">
        <div className="celestial-rule mb-32 mx-auto max-w-7xl" />
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <Reveal>
            <SectionLabel>16 native widgets</SectionLabel>
            <h2 className="mt-8 font-display font-extralight text-white text-[clamp(32px,4.6vw,58px)] leading-[1.05] max-w-3xl tracking-[-0.01em]">
              One workspace.
              <br />
              <span className="text-white/60">Sixteen ways to see the market.</span>
            </h2>
          </Reveal>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {WIDGETS.map((w, i) => (
              <Reveal key={w.name} delay={(i % 8) * 60}>
                <div className="glass-card rounded-xl p-6 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <w.icon size={15} className="text-falcon-gold" />
                    <div className="text-white text-[14.5px] font-medium tracking-tight">{w.name}</div>
                  </div>
                  <div className="text-white/65 text-[13px] leading-[1.7] font-light">
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
