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

interface Widget {
  name: string;
  description: string;
  icon: IconType;
}

interface Category {
  name: string;
  widgets: Widget[];
}

const CATEGORIES: Category[] = [
  {
    name: "Price & flow",
    widgets: [
      { name: "Charting",      description: "Candle, line, area · 8 timeframes · EMA, VWAP, BB, MACD",  icon: CandlestickChart },
      { name: "Level II",      description: "Order book depth, grouped by market maker",                icon: Layers },
      { name: "Time & Sales",  description: "Print-by-print tape with aggressor-side coloring",         icon: List },
      { name: "Options Flow",  description: "Unusual prints, sweeps, gamma, put/call ratios",           icon: Zap },
      { name: "Tape",          description: "Cross-asset scrolling ticker — your situational radar",    icon: Tv2 },
      { name: "Quote",         description: "One-symbol detail — bid, ask, range, fundamentals",        icon: Activity }
    ]
  },
  {
    name: "Research & signal",
    widgets: [
      { name: "AI Research",   description: "Streaming, citation-aware answers grounded in live data",  icon: Sparkles },
      { name: "News",          description: "Wires, filings, macro releases — sentiment-scored",        icon: Newspaper },
      { name: "Sentiment",     description: "Reddit, X, Stocktwits — mention velocity & bull/bear",     icon: MessageCircle },
      { name: "Calendar",      description: "Earnings + macro releases with prior and consensus",       icon: CalendarDays },
      { name: "Screener",      description: "Filter and rank the universe in milliseconds",             icon: Filter }
    ]
  },
  {
    name: "Workspace",
    widgets: [
      { name: "Portfolio",     description: "Live P&L, allocation, beta, AI-generated commentary",      icon: Briefcase },
      { name: "Watchlist",     description: "Sortable lists with sparkline previews and live ticks",    icon: Eye },
      { name: "Heatmap",       description: "Sector-grouped, market-cap-weighted heat across the tape", icon: LayoutGrid },
      { name: "Macro",         description: "Indices, FX, rates, commodities, crypto — one view",       icon: Globe },
      { name: "Notes",         description: "A trade journal embedded in your workspace",               icon: StickyNote }
    ]
  }
];

const DIFFERENTIATORS = [
  {
    title: "One workspace, sixteen tools",
    body: "Everything lives in linked panels you arrange once and save forever. No switching tabs, no separate accounts."
  },
  {
    title: "Built on what retail actually uses",
    body: "We pull from Reddit, X, and Stocktwits alongside the filings tape — the alt-data pros pay six figures for, baked in."
  },
  {
    title: "AI that knows your context",
    body: "Ask in plain English. Falcon AI sees the symbol on your chart, the news in your panel, and the position in your book."
  },
  {
    title: "$0 to start, no enterprise sales call",
    body: "Sign up, open the terminal, go. The pro tier costs less per month than a single Bloomberg lunch."
  }
];

export function Features() {
  return (
    <>
      {/* What sets Falcon apart */}
      <section id="product" className="relative py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-8 h-px bg-falcon-gold/70" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-falcon-gold">
                Why Falcon
              </span>
            </div>
            <h2 className="font-display font-medium text-white text-[clamp(28px,4vw,48px)] leading-[1.05] tracking-[-0.015em] max-w-3xl">
              What sets us apart from everything else on your screen.
            </h2>
          </Reveal>

          <div className="mt-12 grid md:grid-cols-2 gap-3">
            {DIFFERENTIATORS.map((d, i) => (
              <Reveal key={d.title} delay={(i % 2) * 70}>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] hover:border-falcon-gold/30 transition-colors p-6 h-full">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-mono text-[10.5px] text-falcon-gold/85">0{i + 1}</span>
                    <div className="text-white text-[17px] font-medium tracking-tight">
                      {d.title}
                    </div>
                  </div>
                  <p className="text-white/75 text-[13.5px] leading-[1.65] font-light pl-7">
                    {d.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 16 widgets, categorized */}
      <section id="features" className="relative py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-8 h-px bg-falcon-gold/70" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-falcon-gold">
                16 native widgets · 3 categories
              </span>
            </div>
            <h2 className="font-display font-medium text-white text-[clamp(28px,4vw,48px)] leading-[1.05] tracking-[-0.015em] max-w-3xl">
              Every tool the pros use. Organized like the desk you wish you had.
            </h2>
          </Reveal>

          <div className="mt-12 space-y-10">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-white/55">
                    {cat.name}
                  </span>
                  <span className="flex-1 h-px bg-white/8" />
                  <span className="font-mono text-[10.5px] text-white/40">
                    {cat.widgets.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {cat.widgets.map((w) => (
                    <div
                      key={w.name}
                      className="rounded-lg border border-white/8 bg-white/[0.02] hover:border-falcon-gold/30 hover:bg-white/[0.04] transition-colors p-4"
                    >
                      <w.icon size={14} className="text-falcon-gold mb-2.5" />
                      <div className="text-white text-[13px] font-medium tracking-tight">
                        {w.name}
                      </div>
                      <div className="text-white/60 text-[11px] mt-1 leading-[1.55] font-light">
                        {w.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
