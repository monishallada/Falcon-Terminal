"use client";
import { useEffect, useState } from "react";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { getMarket, fmtPrice } from "@/lib/market";
import { getInstrument } from "@/lib/instruments";
import { Layers } from "lucide-react";

interface Lvl { price: number; size: number; mm: string }

const MMs = ["NITE", "ARCX", "EDGX", "MEMX", "CDRG", "VIRT", "JANE", "CITDL", "GSCO", "JEFF"];

export function Level2Widget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];
  const symbol = (panel?.config.symbol as string) ?? "AAPL";
  const inst = getInstrument(symbol);
  const [book, setBook] = useState<{ bids: Lvl[]; asks: Lvl[]; mid: number }>({ bids: [], asks: [], mid: 0 });

  useEffect(() => {
    const m = getMarket();
    function rebuild() {
      const q = m.getQuote(symbol);
      if (!q) return;
      const tick = inst?.asset === "fx" ? 0.0001 : inst?.asset === "rate" ? 0.001 : Math.max(0.01, q.price * 0.0002);
      const bids: Lvl[] = [];
      const asks: Lvl[] = [];
      for (let i = 0; i < 12; i++) {
        bids.push({
          price: q.bid - i * tick,
          size: Math.floor(100 + Math.random() * (i === 0 ? 5000 : 12000)),
          mm: MMs[Math.floor(Math.random() * MMs.length)]
        });
        asks.push({
          price: q.ask + i * tick,
          size: Math.floor(100 + Math.random() * (i === 0 ? 5000 : 12000)),
          mm: MMs[Math.floor(Math.random() * MMs.length)]
        });
      }
      setBook({ bids, asks, mid: q.price });
    }
    rebuild();
    const id = setInterval(rebuild, 700);
    return () => clearInterval(id);
  }, [symbol, inst]);

  const maxSize = Math.max(
    ...book.bids.map((b) => b.size),
    ...book.asks.map((a) => a.size),
    1
  );

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Layers size={12} className="text-falcon-amber" /> Level II</span>}
      subtitle={<span className="text-falcon-amber">{symbol}</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col">
        <div className="p-2 border-b border-line-soft">
          <SymbolPicker value={symbol} onChange={(s) => setPanelSymbol(panelId, s)} />
        </div>
        <div className="grid grid-cols-2 gap-px bg-line-soft">
          <div className="bg-bg-1 px-2 py-1 text-[9.5px] font-mono text-bull uppercase tracking-wider">Bids</div>
          <div className="bg-bg-1 px-2 py-1 text-[9.5px] font-mono text-bear uppercase tracking-wider">Asks</div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-px bg-line-soft overflow-auto">
          <div className="bg-bg-1">
            {book.bids.map((b, i) => (
              <BookRow key={i} side="bid" lvl={b} maxSize={maxSize} asset={inst?.asset} />
            ))}
          </div>
          <div className="bg-bg-1">
            {book.asks.map((a, i) => (
              <BookRow key={i} side="ask" lvl={a} maxSize={maxSize} asset={inst?.asset} />
            ))}
          </div>
        </div>
        <div className="border-t border-line-soft p-1.5 text-center font-mono text-[11px] text-falcon-amber">
          MID {fmtPrice(book.mid, inst?.asset)}
        </div>
      </div>
    </Panel>
  );
}

function BookRow({ side, lvl, maxSize, asset }: { side: "bid" | "ask"; lvl: Lvl; maxSize: number; asset?: string }) {
  const pct = (lvl.size / maxSize) * 100;
  return (
    <div className="relative h-5 flex items-center font-mono text-[10.5px] border-b border-line-soft/30">
      <div
        className={(side === "bid" ? "bg-bull/15 left-0" : "bg-bear/15 left-0") + " absolute top-0 bottom-0"}
        style={{ width: `${pct}%` }}
      />
      <div className="relative w-full flex items-center px-2">
        <span className="text-ink-mute w-12">{lvl.mm}</span>
        <span className="text-ink-dim flex-1 text-right">{lvl.size.toLocaleString()}</span>
        <span className={"text-right w-20 " + (side === "bid" ? "text-bull" : "text-bear")}>
          {fmtPrice(lvl.price, asset)}
        </span>
      </div>
    </div>
  );
}
