"use client";
import { useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { useQuotes } from "@/lib/hooks";
import { fmtPct, fmtPrice, fmtVol } from "@/lib/market";
import { getInstrument } from "@/lib/instruments";
import { Briefcase, Plus, Sparkles, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { SymbolPicker } from "../ui/SymbolPicker";
import { PriceCell } from "../ui/PriceCell";

export function PortfolioWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const positions = useWorkspace((s) => s.positions);
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const addPosition = useWorkspace((s) => s.addPosition);
  const removePosition = useWorkspace((s) => s.removePosition);
  const panel = ws.panels[panelId];

  const symbols = positions.map((p) => p.symbol);
  const quotes = useQuotes(symbols);
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    return positions.map((p) => {
      const q = quotes[p.symbol];
      const inst = getInstrument(p.symbol);
      const price = q?.price ?? p.avgCost;
      const value = price * p.shares;
      const cost = p.avgCost * p.shares;
      const pnl = value - cost;
      const pnlPct = pnl / cost;
      return { p, q, inst, price, value, cost, pnl, pnlPct };
    });
  }, [positions, quotes]);

  const totalValue = rows.reduce((a, r) => a + r.value, 0);
  const totalCost = rows.reduce((a, r) => a + r.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost === 0 ? 0 : totalPnl / totalCost;
  const dayChange = rows.reduce((a, r) => {
    if (!r.q) return a;
    return a + r.q.change * r.p.shares;
  }, 0);
  const dayPct = totalValue ? dayChange / (totalValue - dayChange) : 0;

  // Sector allocation
  const bySector = rows.reduce<Record<string, number>>((m, r) => {
    const s = r.inst?.sector ?? r.inst?.asset ?? "Other";
    m[s] = (m[s] ?? 0) + r.value;
    return m;
  }, {});
  const sectorEntries = Object.entries(bySector).sort((a, b) => b[1] - a[1]);
  const sectorTotal = totalValue || 1;

  // AI summary (deterministic, derived from current state)
  const summary = useMemo(() => {
    if (rows.length === 0) return "No positions yet — add a holding to see analytics.";
    const top = [...rows].sort((a, b) => b.value - a.value)[0];
    const concentration = top.value / (totalValue || 1);
    const topSector = sectorEntries[0]?.[0] ?? "—";
    const topSectorPct = (sectorEntries[0]?.[1] ?? 0) / sectorTotal;
    const winners = rows.filter((r) => r.pnlPct > 0.05).length;
    const losers = rows.filter((r) => r.pnlPct < -0.05).length;
    return [
      `Portfolio is ${fmtPrice(totalValue, undefined)} across ${rows.length} positions; net P&L ${fmtPct(totalPnlPct)}.`,
      `Largest holding: **${top.p.symbol}** at ${(concentration * 100).toFixed(1)}% of book.`,
      `Sector tilt: **${topSector}** at ${(topSectorPct * 100).toFixed(1)}% — ${topSectorPct > 0.45 ? "concentration risk worth monitoring" : "diversified within reasonable bands"}.`,
      `Winners: ${winners}, laggards: ${losers}. Net beta exposure roughly ${weightedBeta(rows).toFixed(2)} vs S&P 500.`
    ].join(" ");
  }, [rows, totalValue, totalPnlPct, sectorEntries, sectorTotal]);

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Briefcase size={12} className="text-falcon-amber" /> Portfolio</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
      rightAdornment={
        <button
          title="Add position"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setAdding((v) => !v); }}
          className="p-1 rounded hover:bg-bg-3 text-ink-mute hover:text-ink"
        >
          <Plus size={12} />
        </button>
      }
    >
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b border-line-soft grid grid-cols-3 gap-2 text-[11px] font-mono">
          <Stat label="Net value" value={"$" + totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
          <Stat label="Day P&L" value={(dayChange >= 0 ? "+$" : "-$") + Math.abs(dayChange).toLocaleString(undefined, { maximumFractionDigits: 0 })} accent={dayChange >= 0 ? "bull" : "bear"} sub={fmtPct(dayPct)} />
          <Stat label="Total P&L" value={(totalPnl >= 0 ? "+$" : "-$") + Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })} accent={totalPnl >= 0 ? "bull" : "bear"} sub={fmtPct(totalPnlPct)} />
        </div>
        {adding && (
          <AddPositionForm
            onCancel={() => setAdding(false)}
            onSubmit={(p) => { addPosition(p); setAdding(false); }}
          />
        )}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px] font-mono">
            <thead className="sticky top-0 bg-bg-2 text-ink-mute uppercase text-[9.5px]">
              <tr className="border-b border-line-soft">
                <th className="text-left px-2 py-1 font-medium">Symbol</th>
                <th className="text-right px-2 py-1 font-medium">Shares</th>
                <th className="text-right px-2 py-1 font-medium">Cost</th>
                <th className="text-right px-2 py-1 font-medium">Last</th>
                <th className="text-right px-2 py-1 font-medium">Value</th>
                <th className="text-right px-2 py-1 font-medium">P&L</th>
                <th className="text-right px-2 py-1 font-medium">P&L %</th>
                <th className="text-right px-2 py-1 font-medium">Wt%</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.p.symbol}
                  className="border-b border-line-soft/40 hover:bg-bg-3 cursor-pointer group"
                  onClick={() => setPanelSymbol(panelId, r.p.symbol)}
                >
                  <td className="px-2 py-1.5">
                    <div className="text-ink font-semibold">{r.p.symbol}</div>
                    <div className="text-[9.5px] text-ink-mute truncate max-w-[140px]">{r.inst?.name}</div>
                  </td>
                  <td className="text-right px-2">{r.p.shares}</td>
                  <td className="text-right px-2 text-ink-dim">{fmtPrice(r.p.avgCost, r.inst?.asset)}</td>
                  <td className="text-right px-2">
                    {r.q ? <PriceCell value={r.q.price} format={(v) => fmtPrice(v, r.inst?.asset)} /> : "—"}
                  </td>
                  <td className="text-right px-2">{"$" + r.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={clsx("text-right px-2", r.pnl >= 0 ? "text-bull" : "text-bear")}>
                    {(r.pnl >= 0 ? "+$" : "-$") + Math.abs(r.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className={clsx("text-right px-2", r.pnlPct >= 0 ? "text-bull" : "text-bear")}>
                    {fmtPct(r.pnlPct)}
                  </td>
                  <td className="text-right px-2 text-ink-dim">
                    {((r.value / (totalValue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="px-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); removePosition(r.p.symbol); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="p-0.5 rounded text-ink-faint hover:text-bear opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line-soft p-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9.5px] uppercase text-ink-mute mb-1.5 tracking-wider">Sector allocation</div>
            <div className="space-y-0.5">
              {sectorEntries.map(([s, v]) => {
                const pct = (v / sectorTotal) * 100;
                return (
                  <div key={s} className="text-[10.5px] font-mono">
                    <div className="flex items-baseline justify-between">
                      <span className="text-ink-dim">{s}</span>
                      <span className="text-ink">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-bg-3 rounded overflow-hidden">
                      <div className="h-full bg-falcon-amber" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase text-ink-mute mb-1.5 tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="text-falcon-amber" /> AI summary
            </div>
            <div className="text-[11px] text-ink-dim leading-relaxed">{boldifyMarkdown(summary)}</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function weightedBeta(rows: { p: { shares: number }; price: number; inst?: { beta?: number } }[]) {
  const total = rows.reduce((a, r) => a + r.p.shares * r.price, 0);
  if (total === 0) return 1;
  return rows.reduce((a, r) => a + (r.inst?.beta ?? 1) * (r.p.shares * r.price) / total, 0);
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "bull" | "bear" }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase text-ink-mute tracking-wider">{label}</div>
      <div className={clsx("text-base", accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-ink")}>
        {value}
      </div>
      {sub && <div className={clsx("text-[10.5px]", accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-ink-mute")}>{sub}</div>}
    </div>
  );
}

function AddPositionForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (p: { symbol: string; shares: number; avgCost: number; purchaseDate: string }) => void }) {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <div className="px-3 py-2 border-b border-line-soft bg-bg-2/60 flex flex-wrap items-end gap-2">
      <div className="w-44">
        <Label>Symbol</Label>
        <SymbolPicker value={symbol} onChange={(s) => setSymbol(s)} />
      </div>
      <div>
        <Label>Shares</Label>
        <input type="number" step="any" value={shares || ""} onChange={(e) => setShares(parseFloat(e.target.value))}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-24 h-6 bg-bg-3/40 border border-line-soft hover:border-line focus:border-falcon-amber rounded px-2 text-[11px] font-mono" />
      </div>
      <div>
        <Label>Avg Cost</Label>
        <input type="number" step="any" value={cost || ""} onChange={(e) => setCost(parseFloat(e.target.value))}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-28 h-6 bg-bg-3/40 border border-line-soft hover:border-line focus:border-falcon-amber rounded px-2 text-[11px] font-mono" />
      </div>
      <div>
        <Label>Date</Label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-36 h-6 bg-bg-3/40 border border-line-soft hover:border-line focus:border-falcon-amber rounded px-2 text-[11px] font-mono" />
      </div>
      <div className="ml-auto flex gap-1.5">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onCancel}
          className="h-6 px-2 rounded text-[10.5px] font-mono text-ink-mute hover:bg-bg-3"
        >
          Cancel
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          disabled={!symbol || !shares || !cost}
          onClick={() => onSubmit({ symbol, shares, avgCost: cost, purchaseDate: date })}
          className="h-6 px-2 rounded text-[10.5px] font-mono bg-falcon-amber/15 text-falcon-amber border border-falcon-amber/30 hover:bg-falcon-amber/25 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[9.5px] uppercase tracking-wider text-ink-mute mb-0.5">{children}</div>;
}

function boldifyMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        parts.push(<strong key={key++} className="text-ink font-semibold">{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    let j = i;
    while (j < text.length && !text.startsWith("**", j)) j++;
    parts.push(text.slice(i, j));
    i = j;
  }
  return parts;
}
