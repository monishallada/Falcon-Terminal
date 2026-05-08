"use client";
import { useMemo } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { useQuotes } from "@/lib/hooks";
import { INSTRUMENTS } from "@/lib/instruments";
import { fmtPct } from "@/lib/market";
import { LayoutGrid } from "lucide-react";
import clsx from "clsx";

const HEAT_SYMBOLS = INSTRUMENTS.filter((i) => i.asset === "equity").slice(0, 30);

export function HeatmapWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];

  const symbols = HEAT_SYMBOLS.map((i) => i.symbol);
  const quotes = useQuotes(symbols);

  const items = useMemo(() => {
    return HEAT_SYMBOLS.map((i) => {
      const q = quotes[i.symbol];
      const w = i.marketCap ?? 1;
      return { sym: i.symbol, name: i.name, sector: i.sector ?? "Other", w, chg: q?.changePct ?? 0 };
    });
  }, [quotes]);

  // Group by sector and compute total weight
  const sectors = useMemo(() => {
    const m = new Map<string, typeof items>();
    items.forEach((it) => {
      if (!m.has(it.sector)) m.set(it.sector, []);
      m.get(it.sector)!.push(it);
    });
    return Array.from(m.entries()).map(([s, list]) => ({
      sector: s,
      total: list.reduce((a, b) => a + b.w, 0),
      list: list.sort((a, b) => b.w - a.w)
    })).sort((a, b) => b.total - a.total);
  }, [items]);

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><LayoutGrid size={12} className="text-falcon-amber" /> Heatmap</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full p-1.5 overflow-auto">
        <div className="flex flex-col gap-1.5">
          {sectors.map((sec) => (
            <div key={sec.sector} className="border border-line-soft/60 rounded">
              <div className="px-2 py-0.5 text-[9.5px] uppercase tracking-wider text-ink-mute border-b border-line-soft/60 bg-bg-2/40">
                {sec.sector}
              </div>
              <div className="flex flex-wrap gap-px p-px">
                {sec.list.map((it) => {
                  const flexBasis = `${Math.max(8, (it.w / sec.total) * 100)}%`;
                  return (
                    <button
                      key={it.sym}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setPanelSymbol(panelId, it.sym)}
                      style={{ flexBasis, backgroundColor: heatColor(it.chg) }}
                      className="min-w-[50px] min-h-[44px] flex flex-col items-center justify-center text-center px-1 rounded-sm hover:ring-1 hover:ring-falcon-amber"
                    >
                      <div className="text-[11px] font-mono font-bold text-white drop-shadow">{it.sym}</div>
                      <div className="text-[10px] font-mono text-white/90 drop-shadow">{fmtPct(it.chg)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function heatColor(chg: number) {
  // Map chg from -3% to +3% onto a red/green gradient
  const x = Math.max(-1, Math.min(1, chg / 0.03));
  if (x >= 0) {
    // green
    const a = 0.2 + x * 0.55;
    return `rgba(22, 199, 132, ${a.toFixed(3)})`;
  } else {
    const a = 0.2 + Math.abs(x) * 0.55;
    return `rgba(234, 57, 67, ${a.toFixed(3)})`;
  }
}
