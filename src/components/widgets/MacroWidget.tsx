"use client";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { useQuotes } from "@/lib/hooks";
import { fmtPct, fmtPrice } from "@/lib/market";
import { getInstrument } from "@/lib/instruments";
import { Globe } from "lucide-react";
import clsx from "clsx";
import { PriceCell } from "../ui/PriceCell";

const SECTIONS: { title: string; symbols: string[] }[] = [
  { title: "Indices", symbols: ["SPX", "NDX", "DJI", "RUT", "VIX"] },
  { title: "Sector ETFs",  symbols: ["SPY", "QQQ", "IWM", "DIA", "VTI"] },
  { title: "FX",       symbols: ["DXY", "EURUSD", "GBPUSD", "USDJPY"] },
  { title: "Commodities", symbols: ["GC", "CL", "NG", "SI"] },
  { title: "Crypto",   symbols: ["BTC", "ETH", "SOL", "AVAX"] },
  { title: "Treasuries", symbols: ["US2Y", "US10Y", "US30Y"] }
];

export function MacroWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const panel = ws.panels[panelId];

  const allSymbols = SECTIONS.flatMap((s) => s.symbols);
  const quotes = useQuotes(allSymbols);

  const ten = quotes["US10Y"]?.price ?? 0;
  const two = quotes["US2Y"]?.price ?? 0;
  const spread = ten - two;

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Globe size={12} className="text-falcon-amber" /> Global Macro</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full overflow-auto p-2 grid grid-cols-2 gap-3">
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="bg-bg-2 border border-line-soft rounded">
            <div className="px-2 py-1 text-[9.5px] uppercase text-ink-mute tracking-wider border-b border-line-soft">
              {sec.title}
            </div>
            <div className="divide-y divide-line-soft/40">
              {sec.symbols.map((sym) => {
                const inst = getInstrument(sym);
                const q = quotes[sym];
                if (!q || !inst) return null;
                const positive = q.changePct >= 0;
                return (
                  <div
                    key={sym}
                    className="px-2 py-1 hover:bg-bg-3 cursor-pointer flex items-center gap-2"
                    onClick={() => setPanelSymbol(panelId, sym)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-mono font-semibold text-ink">{sym}</div>
                      <div className="text-[9.5px] text-ink-mute truncate">{inst.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-mono">
                        <PriceCell value={q.price} format={(v) => fmtPrice(v, inst.asset)} />
                      </div>
                      <div className={clsx("text-[10px] font-mono", positive ? "text-bull" : "text-bear")}>
                        {fmtPct(q.changePct)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="bg-bg-2 border border-line-soft rounded col-span-2 px-3 py-2">
          <div className="text-[9.5px] uppercase text-ink-mute tracking-wider mb-1">Yield Curve & Cross-Asset</div>
          <div className="grid grid-cols-4 gap-3 text-[11px] font-mono">
            <Stat label="2y10y Spread" value={(spread).toFixed(2) + " bps"} accent={spread < 0 ? "bear" : undefined} />
            <Stat label="DXY" value={fmtPrice(quotes["DXY"]?.price ?? 0, "fx")} />
            <Stat label="VIX" value={fmtPrice(quotes["VIX"]?.price ?? 0)} />
            <Stat label="BTC" value={"$" + fmtPrice(quotes["BTC"]?.price ?? 0)} />
          </div>
          <div className="text-[10.5px] text-ink-dim mt-1.5 leading-snug">
            {spread < 0
              ? "The curve remains inverted — historically a late-cycle signal but not necessarily an immediate sell."
              : "The curve has steepened modestly — a normal reading post-cuts; risk-asset implications mixed."}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "bull" | "bear" }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase text-ink-mute tracking-wider">{label}</div>
      <div className={clsx("text-base", accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-ink")}>
        {value}
      </div>
    </div>
  );
}
