"use client";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { useQuote } from "@/lib/hooks";
import { fmtMcap, fmtPct, fmtPrice, fmtVol } from "@/lib/market";
import { getInstrument } from "@/lib/instruments";
import { PriceCell } from "../ui/PriceCell";
import clsx from "clsx";
import { Activity } from "lucide-react";

export function QuoteWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];
  const symbol = (panel?.config.symbol as string) ?? "AAPL";
  const q = useQuote(symbol);
  const inst = getInstrument(symbol);
  const positive = (q?.changePct ?? 0) >= 0;

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Activity size={12} className="text-falcon-amber" /> Quote</span>}
      subtitle={<span className="text-falcon-amber">{symbol}</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col p-3 gap-3 overflow-auto">
        <SymbolPicker value={symbol} onChange={(s) => setPanelSymbol(panelId, s)} />
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-ink">{inst?.symbol}</span>
            <span className="text-[11px] text-ink-mute uppercase">{inst?.exchange ?? inst?.asset}</span>
          </div>
          <div className="text-[12px] text-ink-dim truncate">{inst?.name}</div>
        </div>
        {q && (
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-mono font-bold">
                <PriceCell value={q.price} format={(v) => fmtPrice(v, inst?.asset)} />
              </span>
              <span className={clsx("text-sm font-mono font-semibold", positive ? "text-bull" : "text-bear")}>
                {positive ? "▲" : "▼"} {fmtPrice(Math.abs(q.change), inst?.asset)} ({fmtPct(q.changePct)})
              </span>
            </div>
            <div className="text-[10px] text-ink-mute font-mono mt-1">
              Bid <span className="text-ink">{fmtPrice(q.bid, inst?.asset)} × {q.bidSize}</span>
              {"   "}|{"   "}
              Ask <span className="text-ink">{fmtPrice(q.ask, inst?.asset)} × {q.askSize}</span>
            </div>
          </div>
        )}
        {q && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-mono">
            <Stat label="Open" value={fmtPrice(q.open, inst?.asset)} />
            <Stat label="Volume" value={fmtVol(q.volume)} />
            <Stat label="Day High" value={fmtPrice(q.high, inst?.asset)} />
            <Stat label="Day Low" value={fmtPrice(q.low, inst?.asset)} />
            <Stat label="Prev Close" value={fmtPrice(q.prev, inst?.asset)} />
            <Stat label="Spread" value={fmtPrice(q.ask - q.bid, inst?.asset)} />
            {inst?.high52 !== undefined && <Stat label="52w High" value={fmtPrice(inst.high52!, inst?.asset)} />}
            {inst?.low52 !== undefined && <Stat label="52w Low" value={fmtPrice(inst.low52!, inst?.asset)} />}
            {inst?.marketCap !== undefined && <Stat label="Mkt Cap" value={fmtMcap(inst.marketCap)} />}
            {inst?.pe !== undefined && <Stat label="P/E" value={inst.pe?.toFixed(1) ?? "—"} />}
            {inst?.divYield !== undefined && <Stat label="Yield" value={(inst.divYield * 100).toFixed(2) + "%"} />}
            {inst?.beta !== undefined && <Stat label="Beta" value={inst.beta.toFixed(2)} />}
          </div>
        )}
        {inst?.description && (
          <div className="text-[11px] leading-snug text-ink-dim border-t border-line-soft pt-2">
            {inst.description}
          </div>
        )}
      </div>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line-soft/50 py-0.5">
      <span className="text-ink-mute uppercase text-[9.5px] tracking-wider">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
