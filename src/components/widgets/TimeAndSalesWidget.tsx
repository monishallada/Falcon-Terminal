"use client";
import { useEffect, useRef, useState } from "react";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { getMarket, fmtPrice, fmtVol } from "@/lib/market";
import { getInstrument } from "@/lib/instruments";
import { List } from "lucide-react";

interface Print {
  id: number;
  ts: number;
  price: number;
  size: number;
  side: "buy" | "sell";
  ex: string;
}

export function TimeAndSalesWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];
  const symbol = (panel?.config.symbol as string) ?? "AAPL";
  const inst = getInstrument(symbol);
  const [prints, setPrints] = useState<Print[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    setPrints([]);
    const m = getMarket();
    let last = m.getQuote(symbol)?.price ?? 0;
    const off = m.subscribe(symbol, (q) => {
      const side: "buy" | "sell" = q.price >= last ? "buy" : "sell";
      const size = Math.max(1, Math.floor(Math.pow(Math.random(), 2.5) * 5000));
      const exes = ["NSDQ", "ARCA", "EDGX", "BATS", "IEX", "NYSE"];
      const next: Print = {
        id: counter.current++,
        ts: q.ts,
        price: q.price,
        size,
        side,
        ex: exes[Math.floor(Math.random() * exes.length)]
      };
      setPrints((prev) => {
        const arr = [next, ...prev];
        if (arr.length > 200) arr.length = 200;
        return arr;
      });
      last = q.price;
    });
    return () => off();
  }, [symbol]);

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><List size={12} className="text-falcon-amber" /> Time & Sales</span>}
      subtitle={<span className="text-falcon-amber">{symbol}</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col">
        <div className="p-2 border-b border-line-soft">
          <SymbolPicker value={symbol} onChange={(s) => setPanelSymbol(panelId, s)} />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[10.5px] font-mono">
            <thead className="sticky top-0 bg-bg-2 text-ink-mute uppercase text-[9.5px]">
              <tr className="border-b border-line-soft">
                <th className="text-left px-2 py-1 font-medium">Time</th>
                <th className="text-right px-2 py-1 font-medium">Price</th>
                <th className="text-right px-2 py-1 font-medium">Size</th>
                <th className="text-right px-2 py-1 font-medium">Ex</th>
              </tr>
            </thead>
            <tbody>
              {prints.map((p) => (
                <tr key={p.id} className="border-b border-line-soft/30">
                  <td className="px-2 py-0.5 text-ink-dim">{new Date(p.ts).toLocaleTimeString([], { hour12: false })}</td>
                  <td className={"text-right px-2 py-0.5 " + (p.side === "buy" ? "text-bull" : "text-bear")}>
                    {fmtPrice(p.price, inst?.asset)}
                  </td>
                  <td className="text-right px-2 py-0.5 text-ink">{p.size.toLocaleString()}</td>
                  <td className="text-right px-2 py-0.5 text-ink-mute">{p.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}
