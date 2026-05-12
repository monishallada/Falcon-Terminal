"use client";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { generateBars, fmtPrice, fmtPct, getMarket } from "@/lib/market";
import { getInstrument } from "@/lib/instruments";
import { Bar, Timeframe } from "@/lib/types";
import { Grid3x3 } from "lucide-react";
import clsx from "clsx";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1D"];

/**
 * MultiChart — a 2x2 grid of live mini-charts, each with its own symbol and
 * timeframe. Drawn as lightweight SVG candles (cheap to render 4 of them
 * simultaneously), updating from the same live-tick engine the main chart uses.
 */
export function MultiChartWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const panel = ws.panels[panelId];
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const updatePanel = useWorkspace((s) => s.updatePanel);

  const symbols = useMemo<string[]>(
    () => (panel?.config.symbols as string[]) ?? ["NVDA", "AAPL", "TSLA", "SPY"],
    [panel?.config.symbols]
  );
  const timeframes = useMemo<Timeframe[]>(
    () => (panel?.config.timeframes as Timeframe[]) ?? ["5m", "5m", "5m", "1D"],
    [panel?.config.timeframes]
  );

  function setSymbol(i: number, sym: string) {
    const next = [...symbols];
    next[i] = sym;
    updatePanel(panelId, { config: { symbols: next } });
  }
  function setTf(i: number, tf: Timeframe) {
    const next = [...timeframes];
    next[i] = tf;
    updatePanel(panelId, { config: { timeframes: next } });
  }

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Grid3x3 size={12} className="text-falcon-amber" /> Multi-Chart · 2×2</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
      bodyClassName="grid grid-cols-2 grid-rows-2 gap-px bg-line-soft"
    >
      {symbols.map((sym, i) => (
        <MiniChart
          key={i}
          symbol={sym}
          tf={timeframes[i] ?? "5m"}
          onSymbol={(s) => setSymbol(i, s)}
          onTf={(t) => setTf(i, t)}
        />
      ))}
    </Panel>
  );
}

function MiniChart({
  symbol,
  tf,
  onSymbol,
  onTf
}: {
  symbol: string;
  tf: Timeframe;
  onSymbol: (s: string) => void;
  onTf: (t: Timeframe) => void;
}) {
  const [bars, setBars] = useState<Bar[]>(() => generateBars(symbol, tf, 80));
  const [price, setPrice] = useState<number>(bars[bars.length - 1]?.close ?? 0);
  const [open, setOpen] = useState<number>(bars[0]?.open ?? 0);

  useEffect(() => {
    const fresh = generateBars(symbol, tf, 80);
    setBars(fresh);
    setPrice(fresh[fresh.length - 1]?.close ?? 0);
    setOpen(fresh[0]?.open ?? 0);
    const off = getMarket().subscribe(symbol, (q) => {
      setPrice(q.price);
      // simple last-bar update for the visualization
      setBars((arr) => {
        if (arr.length === 0) return arr;
        const next = arr.slice();
        const last = { ...next[next.length - 1] };
        last.close = q.price;
        last.high = Math.max(last.high, q.price);
        last.low = Math.min(last.low, q.price);
        next[next.length - 1] = last;
        return next;
      });
    });
    return off;
  }, [symbol, tf]);

  const inst = getInstrument(symbol);
  const changePct = open > 0 ? ((price - open) / open) * 100 : 0;
  const up = changePct >= 0;

  return (
    <div className="bg-bg-1 relative flex flex-col min-h-0">
      <div className="h-7 px-1.5 flex items-center gap-1.5 border-b border-line-soft bg-bg-2/40 shrink-0">
        <div className="w-28">
          <SymbolPicker value={symbol} onChange={onSymbol} />
        </div>
        <div className="flex border border-line-soft rounded overflow-hidden">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onTf(t)}
              className={clsx(
                "px-1 h-5 text-[9.5px] font-mono",
                tf === t ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-mute hover:bg-bg-3 hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto text-right">
          <div className="text-[11px] font-mono text-ink leading-none">{fmtPrice(price, inst?.asset)}</div>
          <div className={clsx("text-[9.5px] font-mono leading-none mt-0.5", up ? "text-bull" : "text-bear")}>
            {fmtPct(changePct / 100)}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <CandleSVG bars={bars} />
      </div>
    </div>
  );
}

function CandleSVG({ bars }: { bars: Bar[] }) {
  if (bars.length === 0) return null;
  let hi = -Infinity, lo = Infinity;
  for (const b of bars) {
    if (b.high > hi) hi = b.high;
    if (b.low < lo) lo = b.low;
  }
  const pad = (hi - lo) * 0.06;
  hi += pad; lo -= pad;
  const W = 400;
  const H = 200;
  const range = hi - lo || 1;
  const cw = (W / bars.length) * 0.7;
  const yFor = (p: number) => H - ((p - lo) / range) * H;

  // EMA20 line
  const k = 2 / 21;
  let ema: number | null = null;
  const emaPts: string[] = [];
  bars.forEach((b, i) => {
    if (ema == null) {
      if (i === 19) {
        let s = 0;
        for (let j = 0; j <= i; j++) s += bars[j].close;
        ema = s / 20;
        emaPts.push(`M${(i + 0.5) * (W / bars.length)},${yFor(ema)}`);
      }
    } else {
      ema = b.close * k + ema * (1 - k);
      emaPts.push(`L${(i + 0.5) * (W / bars.length)},${yFor(ema)}`);
    }
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full block">
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1="0" x2={W} y1={H * p} y2={H * p} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {bars.map((b, i) => {
        const x = (i + 0.5) * (W / bars.length);
        const up = b.close >= b.open;
        const color = up ? "#16c784" : "#ea3943";
        const yO = yFor(b.open), yC = yFor(b.close);
        const top = Math.min(yO, yC), bot = Math.max(yO, yC);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={yFor(b.high)} y2={yFor(b.low)} stroke={color} strokeWidth="1" />
            <rect x={x - cw / 2} y={top} width={cw} height={Math.max(1, bot - top)} fill={color} />
          </g>
        );
      })}
      <path d={emaPts.join(" ")} fill="none" stroke="rgba(255,176,32,0.85)" strokeWidth="1.2" />
    </svg>
  );
}
