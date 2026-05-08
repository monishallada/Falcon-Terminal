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

const PILLARS: { title: string; body: string; icon: React.ComponentType<{ size?: number | string; className?: string }> }[] = [
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

const WIDGETS: { name: string; description: string; icon: React.ComponentType<{ size?: number | string; className?: string }> }[] = [
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
      <section id="product" className="relative bg-black py-28 sm:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <SectionLabel>An operating system for investing</SectionLabel>
          <h2 className="mt-6 font-display font-extralight text-white text-[clamp(34px,5vw,64px)] leading-[1.05] tracking-tight max-w-3xl">
            The terminal you couldn&apos;t afford —
            <span className="brand-gradient"> reimagined for retail.</span>
          </h2>
          <p className="mt-8 text-white/60 text-[16px] leading-relaxed max-w-2xl font-light">
            Falcon is a single, modular workspace where every panel is a widget — chart, news,
            options flow, AI chat, portfolio. Arrange them once, and they follow you across
            devices.
          </p>

          <div className="mt-20 grid md:grid-cols-3 gap-5">
            {PILLARS.map((p) => (
              <div key={p.title} className="glass-card rounded-2xl p-7">
                <div className="w-10 h-10 rounded-lg bg-falcon-gold/10 border border-falcon-gold/30 flex items-center justify-center mb-5">
                  <p.icon size={18} className="text-falcon-gold" />
                </div>
                <div className="text-white text-[18px] font-medium mb-2">{p.title}</div>
                <div className="text-white/55 text-[14px] leading-relaxed font-light">{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Widget grid */}
      <section id="features" className="relative bg-black py-28 sm:py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <SectionLabel>16 native widgets</SectionLabel>
          <h2 className="mt-6 font-display font-extralight text-white text-[clamp(30px,4.2vw,52px)] leading-[1.05] max-w-3xl">
            One workspace.
            <br />
            <span className="text-white/55">Sixteen ways to see the market.</span>
          </h2>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {WIDGETS.map((w) => (
              <div key={w.name} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <w.icon size={14} className="text-falcon-gold" />
                  <div className="text-white text-[14px] font-medium">{w.name}</div>
                </div>
                <div className="text-white/50 text-[12.5px] leading-snug font-light">
                  {w.description}
                </div>
              </div>
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
      <span className="block w-6 h-px bg-falcon-gold/60" />
      <span className="spaced-display text-[10.5px] sm:text-[11px] uppercase tracking-[0.4em] text-falcon-gold/80">
        {children}
      </span>
    </div>
  );
}
