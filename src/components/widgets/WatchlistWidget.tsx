"use client";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { useQuotes } from "@/lib/hooks";
import { fmtPct, fmtPrice, fmtVol } from "@/lib/market";
import { getInstrument } from "@/lib/instruments";
import { Sparkline } from "../ui/Sparkline";
import { PriceCell } from "../ui/PriceCell";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Eye, Plus, Trash2 } from "lucide-react";
import { SymbolPicker } from "../ui/SymbolPicker";

export function WatchlistWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const watchlist = useWorkspace((s) => s.watchlist);
  const remove = useWorkspace((s) => s.removeFromWatchlist);
  const add = useWorkspace((s) => s.addToWatchlist);
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);

  const panel = ws.panels[panelId];
  const quotes = useQuotes(watchlist);
  const [adding, setAdding] = useState(false);
  const sparkRef = useRef<Record<string, number[]>>({});
  // Keep a small rolling window for sparkline animation
  useEffect(() => {
    const id = setInterval(() => {
      const next = { ...sparkRef.current };
      Object.values(quotes).forEach((q) => {
        const arr = next[q.symbol] ?? [];
        arr.push(q.price);
        if (arr.length > 36) arr.shift();
        next[q.symbol] = arr;
      });
      sparkRef.current = next;
    }, 1500);
    return () => clearInterval(id);
  }, [quotes]);

  const rows = useMemo(() => watchlist.map((s) => ({ s, q: quotes[s] })), [watchlist, quotes]);

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Eye size={12} className="text-falcon-amber" /> Watchlist</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
      rightAdornment={
        <button
          title="Add symbol"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setAdding((v) => !v); }}
          className="p-1 rounded hover:bg-bg-3 text-ink-mute hover:text-ink"
        >
          <Plus size={12} />
        </button>
      }
    >
      <div className="h-full flex flex-col">
        {adding && (
          <div className="p-2 border-b border-line-soft bg-bg-2/60">
            <SymbolPicker
              value=""
              placeholder="Add a symbol..."
              onChange={(s) => { add(s); setAdding(false); }}
            />
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px] font-mono">
            <thead className="sticky top-0 bg-bg-2 text-ink-mute uppercase text-[9.5px]">
              <tr className="border-b border-line-soft">
                <th className="text-left px-2 py-1 font-medium">Symbol</th>
                <th className="text-right px-2 py-1 font-medium">Last</th>
                <th className="text-right px-2 py-1 font-medium">Chg%</th>
                <th className="text-right px-2 py-1 font-medium">Vol</th>
                <th className="text-right px-2 py-1 font-medium">Trend</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ s, q }) => {
                const inst = getInstrument(s);
                const positive = (q?.changePct ?? 0) >= 0;
                return (
                  <tr
                    key={s}
                    onClick={() => setPanelSymbol(panelId, s)}
                    className={clsx(
                      "cursor-pointer hover:bg-bg-3 group border-b border-line-soft/40",
                      panel?.config.symbol === s && "bg-bg-3"
                    )}
                  >
                    <td className="px-2 py-1.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-ink font-semibold">{s}</span>
                        <span className="text-[9.5px] text-ink-mute uppercase">{inst?.asset}</span>
                      </div>
                      <div className="text-[9.5px] text-ink-mute truncate max-w-[140px]">{inst?.name}</div>
                    </td>
                    <td className="text-right px-2 py-1.5">
                      {q ? <PriceCell value={q.price} format={(v) => fmtPrice(v, inst?.asset)} /> : "—"}
                    </td>
                    <td className={clsx("text-right px-2 py-1.5", positive ? "text-bull" : "text-bear")}>
                      {q ? fmtPct(q.changePct) : "—"}
                    </td>
                    <td className="text-right px-2 py-1.5 text-ink-dim">{q ? fmtVol(q.volume) : "—"}</td>
                    <td className="text-right px-2 py-1.5">
                      <Sparkline values={sparkRef.current[s] ?? []} positive={positive} />
                    </td>
                    <td className="px-1 py-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(s); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-0.5 rounded text-ink-faint hover:text-bear opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}
