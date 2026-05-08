"use client";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { generateOptionsTrades } from "@/lib/news";
import { OptionsTrade } from "@/lib/types";
import { Zap, Flame } from "lucide-react";
import clsx from "clsx";
import { nanoid } from "nanoid";
import { INSTRUMENTS } from "@/lib/instruments";

export function OptionsFlowWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];
  const filterSymbol = panel?.config.symbol as string | undefined;
  const minPremium = (panel?.config.minPremium as number) ?? 0;
  const sideFilter = (panel?.config.side as "all" | "call" | "put") ?? "all";

  const [trades, setTrades] = useState<OptionsTrade[]>([]);
  useEffect(() => {
    setTrades(generateOptionsTrades(120));
    const id = setInterval(() => {
      // Add 1-3 new trades
      const fresh = generateOptionsTrades(1 + Math.floor(Math.random() * 3));
      fresh.forEach((t) => (t.ts = Date.now()));
      setTrades((prev) => {
        const arr = [...fresh, ...prev];
        if (arr.length > 250) arr.length = 250;
        return arr;
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (filterSymbol && t.symbol !== filterSymbol) return false;
      if (sideFilter !== "all" && t.side !== sideFilter) return false;
      if (t.premium < minPremium) return false;
      return true;
    });
  }, [trades, filterSymbol, sideFilter, minPremium]);

  // Aggregates
  const callPrem = trades.filter((t) => t.side === "call").reduce((a, b) => a + b.premium, 0);
  const putPrem = trades.filter((t) => t.side === "put").reduce((a, b) => a + b.premium, 0);
  const pcr = (putPrem / Math.max(1, callPrem)).toFixed(2);
  const callVol = trades.filter((t) => t.side === "call").reduce((a, b) => a + b.size, 0);
  const putVol = trades.filter((t) => t.side === "put").reduce((a, b) => a + b.size, 0);

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Zap size={12} className="text-falcon-amber" /> Options Flow</span>}
      subtitle={filterSymbol ? <span className="text-falcon-amber">{filterSymbol}</span> : <span className="text-ink-mute">all symbols</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col">
        <div className="px-2 py-1.5 border-b border-line-soft flex items-center gap-2 text-[10.5px] font-mono">
          <span className="text-ink-mute">PCR</span>
          <span className="text-ink">{pcr}</span>
          <span className="text-ink-mute ml-2">Calls</span>
          <span className="text-bull">{callVol.toLocaleString()}</span>
          <span className="text-ink-mute ml-2">Puts</span>
          <span className="text-bear">{putVol.toLocaleString()}</span>
          <div className="ml-auto flex items-center gap-1">
            {(["all", "call", "put"] as const).map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => useWorkspace.getState().updatePanel(panelId, { config: { side: s } })}
                className={clsx(
                  "px-2 h-6 rounded border uppercase text-[10px]",
                  sideFilter === s ? "border-falcon-amber/50 bg-falcon-amber/10 text-falcon-amber" : "border-line-soft text-ink-mute hover:text-ink"
                )}
              >
                {s}
              </button>
            ))}
            <select
              value={minPremium}
              onChange={(e) => useWorkspace.getState().updatePanel(panelId, { config: { minPremium: parseFloat(e.target.value) } })}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-6 bg-bg-3/40 border border-line-soft rounded px-1 text-[10px] font-mono"
            >
              <option value={0}>Any premium</option>
              <option value={100_000}>≥ $100K</option>
              <option value={500_000}>≥ $500K</option>
              <option value={1_000_000}>≥ $1M</option>
              <option value={5_000_000}>≥ $5M</option>
            </select>
            {filterSymbol && (
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => useWorkspace.getState().updatePanel(panelId, { config: { symbol: undefined } })}
                className="px-1.5 h-6 rounded text-ink-mute hover:bg-bg-3"
              >
                Clear ×
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[10.5px] font-mono">
            <thead className="sticky top-0 bg-bg-2 text-ink-mute uppercase text-[9.5px]">
              <tr className="border-b border-line-soft">
                <th className="text-left px-2 py-1 font-medium">Time</th>
                <th className="text-left px-2 py-1 font-medium">Sym</th>
                <th className="text-center px-2 py-1 font-medium">Side</th>
                <th className="text-right px-2 py-1 font-medium">Strike</th>
                <th className="text-right px-2 py-1 font-medium">Exp</th>
                <th className="text-right px-2 py-1 font-medium">Size</th>
                <th className="text-right px-2 py-1 font-medium">Price</th>
                <th className="text-right px-2 py-1 font-medium">Premium</th>
                <th className="text-right px-2 py-1 font-medium">Spot</th>
                <th className="text-center px-2 py-1 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setPanelSymbol(panelId, t.symbol)}
                  className={clsx(
                    "border-b border-line-soft/30 cursor-pointer hover:bg-bg-3",
                    t.unusual && "bg-falcon-amber/5"
                  )}
                >
                  <td className="px-2 py-0.5 text-ink-dim">{new Date(t.ts).toLocaleTimeString([], { hour12: false })}</td>
                  <td className="px-2 py-0.5 text-ink font-semibold">{t.symbol}</td>
                  <td className={clsx("px-2 py-0.5 text-center font-bold", t.side === "call" ? "text-bull" : "text-bear")}>
                    {t.side.toUpperCase()}
                  </td>
                  <td className="text-right px-2 py-0.5">${t.strike}</td>
                  <td className="text-right px-2 py-0.5 text-ink-dim">{t.expiry.slice(5)}</td>
                  <td className="text-right px-2 py-0.5">{t.size.toLocaleString()}</td>
                  <td className="text-right px-2 py-0.5 text-ink-dim">${t.price}</td>
                  <td className={clsx("text-right px-2 py-0.5 font-bold", t.premium > 1_000_000 && "text-falcon-amber")}>
                    ${(t.premium / 1000).toFixed(1)}K
                  </td>
                  <td className="text-right px-2 py-0.5 text-ink-dim">${t.spotAtTrade}</td>
                  <td className="text-center px-2 py-0.5">
                    <div className="inline-flex gap-1">
                      {t.unusual && <span className="px-1 rounded bg-falcon-amber/15 text-falcon-amber text-[9px] font-bold">UNUSUAL</span>}
                      {t.sweep && <span className="px-1 rounded bg-falcon-orange/15 text-falcon-orange text-[9px] font-bold flex items-center gap-0.5"><Flame size={8} /> SWEEP</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}
