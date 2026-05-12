"use client";
import { useQuotes } from "@/lib/hooks";
import { getInstrument } from "@/lib/instruments";
import { fmtPct, fmtPrice } from "@/lib/market";
import clsx from "clsx";

interface Group {
  title: string;
  symbols: string[];
  // SF symbol-style mini glyph or text on the round chip
  chipColor?: string;
}

const GROUPS: Group[] = [
  {
    title: "Global indices",
    symbols: ["SPX", "NDX", "DJI", "RUT", "VIX"],
    chipColor: "#7c89a6"
  },
  {
    title: "Mega caps",
    symbols: ["NVDA", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"],
    chipColor: "#1c1f29"
  },
  {
    title: "Semis & AI",
    symbols: ["NVDA", "AMD", "TSM", "AVGO", "MU", "SMCI", "ARM"],
    chipColor: "#1f2a3d"
  },
  {
    title: "Banks & financials",
    symbols: ["JPM", "BAC", "WFC", "GS", "MS", "C", "BLK"],
    chipColor: "#1d2a23"
  },
  {
    title: "Energy & commodities",
    symbols: ["XOM", "CVX", "OXY", "SLB", "USO", "GLD", "CL"],
    chipColor: "#2d2519"
  },
  {
    title: "Crypto majors",
    symbols: ["BTC", "ETH", "SOL", "AVAX", "DOGE", "XRP"],
    chipColor: "#2a1d3a"
  }
];

export function LiveTickers() {
  // One subscription pool covering every visible symbol
  const allSymbols = Array.from(new Set(GROUPS.flatMap((g) => g.symbols)));
  const quotes = useQuotes(allSymbols);

  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center gap-3 mb-10">
          <span className="block w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-white/85">
            Live · six themes · streaming tick-by-tick
          </span>
          <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/40 hidden sm:inline">
            scroll horizontally →
          </span>
        </div>

        <div className="space-y-10">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-white text-[20px] sm:text-[22px] font-medium tracking-[-0.01em]">
                  {g.title}
                </h3>
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-white/45">
                  {g.symbols.length} watching
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 sm:-mx-10 sm:px-10 snap-x snap-mandatory">
                {g.symbols.map((sym) => (
                  <TickerCard
                    key={sym}
                    symbol={sym}
                    quote={quotes[sym]}
                    chipColor={g.chipColor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface CardProps {
  symbol: string;
  quote: ReturnType<typeof useQuotes>[string] | undefined;
  chipColor?: string;
}

function TickerCard({ symbol, quote, chipColor }: CardProps) {
  const inst = getInstrument(symbol);
  const positive = (quote?.changePct ?? 0) >= 0;
  const initial = symbol.slice(0, symbol === "GOOGL" ? 1 : 1);

  return (
    <div
      className={clsx(
        "snap-start shrink-0 w-[200px] sm:w-[224px] rounded-2xl border bg-white/[0.03] backdrop-blur-sm",
        "border-white/8 hover:border-falcon-gold/40 transition-colors",
        "px-4 py-4"
      )}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
          style={{
            background: chipColor ?? "#1c1f29",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)"
          }}
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-white text-[13.5px] font-semibold leading-none truncate">{symbol}</div>
          <div className="text-white/55 text-[11px] mt-1 truncate">
            {inst?.name ?? "—"}
          </div>
        </div>
      </div>

      <div className="font-mono text-white text-[18px] sm:text-[19px] leading-none">
        {quote ? fmtPrice(quote.price, inst?.asset) : "—"}
        <span className="text-white/45 text-[10.5px] ml-1.5 align-middle">
          {inst?.asset === "rate" ? "" : inst?.asset === "crypto" ? "USD" : "USD"}
        </span>
      </div>

      <div
        className={clsx(
          "mt-2.5 inline-flex items-center gap-1 text-[12px] font-mono",
          positive ? "text-bull" : "text-bear"
        )}
      >
        <span>{positive ? "▲" : "▼"}</span>
        <span>{quote ? fmtPct(quote.changePct) : "—"}</span>
      </div>
    </div>
  );
}
