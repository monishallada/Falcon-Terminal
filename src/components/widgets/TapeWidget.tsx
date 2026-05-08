"use client";
import { useEffect, useState } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { getMarket, fmtPrice, fmtPct } from "@/lib/market";
import { Quote } from "@/lib/types";
import { Tv2 } from "lucide-react";
import clsx from "clsx";

const TAPE_SYMBOLS = [
  "SPY", "QQQ", "IWM", "DIA", "VIX",
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD", "AVGO", "NFLX",
  "JPM", "BAC", "GS", "V",
  "LLY", "UNH", "JNJ",
  "WMT", "COST", "MCD",
  "XOM", "CVX",
  "BTC", "ETH", "SOL", "DOGE",
  "GC", "CL", "EURUSD", "DXY"
];

export function TapeWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  useEffect(() => {
    const m = getMarket();
    const initial: Record<string, Quote> = {};
    TAPE_SYMBOLS.forEach((s) => {
      const q = m.getQuote(s);
      if (q) initial[s] = q;
    });
    setQuotes(initial);
    const id = setInterval(() => {
      const next: Record<string, Quote> = {};
      TAPE_SYMBOLS.forEach((s) => {
        const q = m.getQuote(s);
        if (q) next[s] = q;
      });
      setQuotes(next);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const items = TAPE_SYMBOLS.map((s) => quotes[s]).filter(Boolean) as Quote[];
  // Duplicate the row to enable seamless infinite scroll
  const doubled = [...items, ...items];

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Tv2 size={12} className="text-falcon-amber" /> Tape</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full overflow-hidden flex items-center">
        <div className="tape-track">
          {doubled.map((q, i) => (
            <TapeCell key={`${q.symbol}-${i}`} q={q} />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function TapeCell({ q }: { q: Quote }) {
  const positive = q.changePct >= 0;
  return (
    <div className="px-3 py-2 border-r border-line-soft flex items-center gap-2 whitespace-nowrap">
      <span className="font-mono text-[12px] font-semibold text-ink">{q.symbol}</span>
      <span className="font-mono text-[12px] text-ink-dim">{fmtPrice(q.price)}</span>
      <span className={clsx("font-mono text-[11px]", positive ? "text-bull" : "text-bear")}>
        {positive ? "▲" : "▼"} {fmtPct(q.changePct)}
      </span>
    </div>
  );
}
