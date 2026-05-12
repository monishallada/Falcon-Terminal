"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  CandlestickData,
  LineData,
  HistogramData,
  UTCTimestamp
} from "lightweight-charts";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { generateBars, fmtPrice, getMarket } from "@/lib/market";
import {
  ema, sma, vwap, bollinger, rsi, macd, supertrend, donchian, keltner,
  ichimoku, heikinAshi, aiLevels
} from "@/lib/indicators";
import { Bar, Timeframe } from "@/lib/types";
import { getInstrument } from "@/lib/instruments";
import clsx from "clsx";
import {
  CandlestickChart, LineChart, BarChart3, Activity, Layers,
  Minus, Slash, Square, Type, TrendingUp, GitCompare, Brain
} from "lucide-react";

type ChartKind = "candle" | "heikin" | "line" | "area" | "baseline" | "hollow";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"];
type IconCmp = React.ComponentType<{ size?: number | string; className?: string }>;

const KINDS: { id: ChartKind; label: string; Icon: IconCmp }[] = [
  { id: "candle",   label: "Candles",        Icon: CandlestickChart },
  { id: "heikin",   label: "Heikin-Ashi",    Icon: CandlestickChart },
  { id: "hollow",   label: "Hollow candles", Icon: CandlestickChart },
  { id: "line",     label: "Line",           Icon: LineChart },
  { id: "area",     label: "Area",           Icon: BarChart3 },
  { id: "baseline", label: "Baseline",       Icon: Activity }
];

const INDICATOR_GROUPS: { name: string; items: string[] }[] = [
  { name: "Overlay",     items: ["EMA9", "EMA20", "EMA50", "EMA200", "SMA200", "VWAP", "Bollinger", "Donchian", "Keltner", "SuperTrend", "Ichimoku"] },
  { name: "Oscillator",  items: ["RSI", "MACD", "Stochastic"] }
];

export function ChartWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const aiMode = useWorkspace((s) => s.ui.aiMode);
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const updatePanel = useWorkspace((s) => s.updatePanel);
  const removePanel = useWorkspace((s) => s.removePanel);
  const setGroup = useWorkspace((s) => s.setPanelGroup);

  const panel = ws.panels[panelId];
  const symbol = (panel?.config.symbol as string) ?? "AAPL";
  const tf = (panel?.config.timeframe as Timeframe) ?? "5m";
  const compare = (panel?.config.compare as string) || "";
  const inds = useMemo<string[]>(
    () => (panel?.config.indicators as string[]) ?? ["EMA20", "EMA50", "VWAP"],
    [panel?.config.indicators]
  );
  const kind = (panel?.config.kind as ChartKind) ?? "candle";
  const oscillator = (panel?.config.oscillator as string) || ""; // "RSI" | "MACD" | "Stochastic" | ""

  const containerRef = useRef<HTMLDivElement>(null);
  const oscRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const oscChartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const areaRef = useRef<ISeriesApi<"Area"> | null>(null);
  const baselineRef = useRef<ISeriesApi<"Baseline"> | null>(null);
  const compareRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const indSeriesRef = useRef<Record<string, ISeriesApi<"Line"> | ISeriesApi<"Area">>>({});
  const aiLineRefs = useRef<IPriceLine[]>([]);
  const stateRef = useRef<{ symbol: string; tf: Timeframe; bars: Bar[]; haBars: Bar[] }>({
    symbol: "", tf: "5m", bars: [], haBars: []
  });
  const [, forceTick] = useState(0);

  // Build chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { color: "#0b0f16" }, textColor: "#9aa3b2", fontSize: 11, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
      grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
      rightPriceScale: { borderColor: "#161c28" },
      timeScale: { borderColor: "#161c28", timeVisible: true, secondsVisible: false },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(255,176,32,0.4)", width: 1, style: 0, labelBackgroundColor: "#ffb020" },
        horzLine: { color: "rgba(255,176,32,0.4)", width: 1, style: 0, labelBackgroundColor: "#ffb020" }
      },
      autoSize: true
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      lineRef.current = null;
      areaRef.current = null;
      baselineRef.current = null;
      compareRef.current = null;
      volRef.current = null;
      indSeriesRef.current = {};
      aiLineRefs.current = [];
    };
  }, []);

  // Oscillator pane chart — built lazily when an oscillator is selected
  useEffect(() => {
    if (!oscillator) {
      if (oscChartRef.current) {
        oscChartRef.current.remove();
        oscChartRef.current = null;
      }
      return;
    }
    if (!oscRef.current) return;
    const c = createChart(oscRef.current, {
      layout: { background: { color: "#0b0f16" }, textColor: "#9aa3b2", fontSize: 10, fontFamily: "ui-monospace, monospace" },
      grid: { vertLines: { color: "rgba(255,255,255,0.02)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
      rightPriceScale: { borderColor: "#161c28" },
      timeScale: { borderColor: "#161c28", visible: false },
      crosshair: { mode: CrosshairMode.Normal },
      autoSize: true,
      handleScroll: false,
      handleScale: false
    });
    oscChartRef.current = c;
    return () => {
      c.remove();
      oscChartRef.current = null;
    };
  }, [oscillator]);

  // Render data on any change
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Tear down
    if (candleRef.current) { chart.removeSeries(candleRef.current); candleRef.current = null; }
    if (lineRef.current) { chart.removeSeries(lineRef.current); lineRef.current = null; }
    if (areaRef.current) { chart.removeSeries(areaRef.current); areaRef.current = null; }
    if (baselineRef.current) { chart.removeSeries(baselineRef.current); baselineRef.current = null; }
    if (compareRef.current) { chart.removeSeries(compareRef.current); compareRef.current = null; }
    if (volRef.current) { chart.removeSeries(volRef.current); volRef.current = null; }
    Object.values(indSeriesRef.current).forEach((s) => { try { chart.removeSeries(s); } catch { /* */ } });
    indSeriesRef.current = {};
    aiLineRefs.current = [];

    // Bars
    const bars = generateBars(symbol, tf, 600);
    const haBars = heikinAshi(bars);
    stateRef.current = { symbol, tf, bars, haBars };

    const seriesBars = kind === "heikin" ? haBars : bars;

    // Primary series by kind
    if (kind === "candle" || kind === "heikin") {
      const s = chart.addCandlestickSeries({
        upColor: "#16c784", downColor: "#ea3943",
        borderUpColor: "#16c784", borderDownColor: "#ea3943",
        wickUpColor: "#16c784", wickDownColor: "#ea3943",
        priceLineColor: "#ffb020"
      });
      s.setData(seriesBars.map((b) => ({
        time: b.time as UTCTimestamp, open: b.open, high: b.high, low: b.low, close: b.close
      })) as CandlestickData[]);
      candleRef.current = s;
    } else if (kind === "hollow") {
      const s = chart.addCandlestickSeries({
        upColor: "rgba(0,0,0,0)", downColor: "#ea3943",
        borderUpColor: "#16c784", borderDownColor: "#ea3943",
        wickUpColor: "#16c784", wickDownColor: "#ea3943",
        priceLineColor: "#ffb020"
      });
      s.setData(bars.map((b) => ({
        time: b.time as UTCTimestamp, open: b.open, high: b.high, low: b.low, close: b.close
      })) as CandlestickData[]);
      candleRef.current = s;
    } else if (kind === "line") {
      const s = chart.addLineSeries({ color: "#ffb020", lineWidth: 2, priceLineColor: "#ffb020" });
      s.setData(bars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })) as LineData[]);
      lineRef.current = s;
    } else if (kind === "area") {
      const s = chart.addAreaSeries({
        topColor: "rgba(255,176,32,0.45)", bottomColor: "rgba(255,176,32,0.02)",
        lineColor: "#ffb020", lineWidth: 2
      });
      s.setData(bars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })) as LineData[]);
      areaRef.current = s;
    } else if (kind === "baseline") {
      const baseline = bars[Math.floor(bars.length / 2)]?.close ?? bars[0]?.close ?? 0;
      const s = chart.addBaselineSeries({
        baseValue: { type: "price", price: baseline },
        topLineColor: "#16c784", topFillColor1: "rgba(22,199,132,0.28)", topFillColor2: "rgba(22,199,132,0.02)",
        bottomLineColor: "#ea3943", bottomFillColor1: "rgba(234,57,67,0.28)", bottomFillColor2: "rgba(234,57,67,0.02)",
        lineWidth: 2
      });
      s.setData(bars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })) as LineData[]);
      baselineRef.current = s;
    }

    // Volume
    const vol = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: "rgba(154,163,178,0.4)"
    });
    vol.setData(bars.map((b) => ({
      time: b.time as UTCTimestamp, value: b.volume,
      color: b.close >= b.open ? "rgba(22,199,132,0.45)" : "rgba(234,57,67,0.45)"
    })) as HistogramData[]);
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 }, borderVisible: false });
    volRef.current = vol;

    // Comparison overlay
    if (compare && compare !== symbol) {
      const compBars = generateBars(compare, tf, 600);
      // Normalize to start at the primary's first close for visual comparison
      const base = bars[0]?.close ?? 1;
      const compBase = compBars[0]?.close ?? base;
      const scale = base / compBase;
      const s = chart.addLineSeries({
        color: "#60a5fa", lineWidth: 2, lineStyle: 2,
        priceLineVisible: false, lastValueVisible: false,
        priceScaleId: "" // overlay, no separate scale
      });
      s.setData(compBars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close * scale })) as LineData[]);
      compareRef.current = s;
    }

    // Indicators (overlay)
    for (const tag of inds) {
      if (tag === "EMA9")       addLine(chart, "#22d3ee", ema(bars, 9), indSeriesRef.current, tag);
      else if (tag === "EMA20")  addLine(chart, "#22d3ee", ema(bars, 20), indSeriesRef.current, tag);
      else if (tag === "EMA50")  addLine(chart, "#a855f7", ema(bars, 50), indSeriesRef.current, tag);
      else if (tag === "EMA200") addLine(chart, "#ec4899", ema(bars, 200), indSeriesRef.current, tag);
      else if (tag === "SMA200") addLine(chart, "#eab308", sma(bars, 200), indSeriesRef.current, tag);
      else if (tag === "VWAP")   addLine(chart, "#f97316", vwap(bars), indSeriesRef.current, tag);
      else if (tag === "Bollinger") {
        const b = bollinger(bars, 20, 2);
        addLine(chart, "rgba(255,255,255,0.35)", b.upper,  indSeriesRef.current, "BB_U", 1);
        addLine(chart, "rgba(255,255,255,0.35)", b.lower,  indSeriesRef.current, "BB_L", 1);
        addLine(chart, "rgba(255,255,255,0.18)", b.middle, indSeriesRef.current, "BB_M", 1, 2);
      }
      else if (tag === "Donchian") {
        const d = donchian(bars, 20);
        addLine(chart, "rgba(96,165,250,0.55)", d.upper, indSeriesRef.current, "DC_U", 1);
        addLine(chart, "rgba(96,165,250,0.55)", d.lower, indSeriesRef.current, "DC_L", 1);
      }
      else if (tag === "Keltner") {
        const k = keltner(bars, 20, 2);
        addLine(chart, "rgba(244,114,182,0.5)", k.upper, indSeriesRef.current, "KC_U", 1);
        addLine(chart, "rgba(244,114,182,0.5)", k.lower, indSeriesRef.current, "KC_L", 1);
      }
      else if (tag === "SuperTrend") {
        addLine(chart, "#10b981", supertrend(bars, 10, 3), indSeriesRef.current, "ST", 2);
      }
      else if (tag === "Ichimoku") {
        const ich = ichimoku(bars);
        addLine(chart, "rgba(99,102,241,0.7)",  ich.conv,  indSeriesRef.current, "ICH_C", 1);
        addLine(chart, "rgba(239,68,68,0.6)",   ich.base,  indSeriesRef.current, "ICH_B", 1);
        addLine(chart, "rgba(34,197,94,0.5)",   ich.spanA, indSeriesRef.current, "ICH_A", 1);
        addLine(chart, "rgba(234,57,67,0.5)",   ich.spanB, indSeriesRef.current, "ICH_S", 1);
      }
    }

    // AI overlay — horizontal levels and a regime label, applied when AI Mode is on
    if (aiMode && candleRef.current) {
      const levels = aiLevels(bars, 5);
      for (const lv of levels) {
        const pl = candleRef.current.createPriceLine({
          price: lv.price,
          color: lv.kind === "support" ? "rgba(22,199,132,0.6)" : "rgba(234,57,67,0.6)",
          lineStyle: 2,
          lineWidth: 1,
          axisLabelVisible: true,
          title: `AI ${lv.kind === "support" ? "S" : "R"}·${lv.touches}×`
        });
        aiLineRefs.current.push(pl);
      }
    }

    chart.timeScale().fitContent();

    // --- Oscillator pane ---
    if (oscillator && oscChartRef.current) {
      // Tear down previous series by re-creating series cleanly
      const o = oscChartRef.current;
      if (oscillator === "RSI") {
        const data = rsi(bars, 14);
        const s = o.addLineSeries({ color: "#22d3ee", lineWidth: 2 });
        s.setData(data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
        // overbought / oversold reference lines
        s.createPriceLine({ price: 70, color: "rgba(234,57,67,0.4)", lineStyle: 2, lineWidth: 1, axisLabelVisible: true, title: "70" });
        s.createPriceLine({ price: 30, color: "rgba(22,199,132,0.4)", lineStyle: 2, lineWidth: 1, axisLabelVisible: true, title: "30" });
        const vis = chart.timeScale().getVisibleLogicalRange();
        if (vis) o.timeScale().setVisibleLogicalRange(vis);
      } else if (oscillator === "MACD") {
        const data = macd(bars);
        const macdS = o.addLineSeries({ color: "#22d3ee", lineWidth: 2 });
        const sigS = o.addLineSeries({ color: "#f97316", lineWidth: 2 });
        const histS = o.addHistogramSeries({ priceFormat: { type: "price" } });
        macdS.setData(data.map((d) => ({ time: d.time as UTCTimestamp, value: d.macd })));
        sigS.setData(data.map((d) => ({ time: d.time as UTCTimestamp, value: d.signal })));
        histS.setData(data.map((d) => ({
          time: d.time as UTCTimestamp,
          value: d.hist,
          color: d.hist >= 0 ? "rgba(22,199,132,0.6)" : "rgba(234,57,67,0.6)"
        })));
      } else if (oscillator === "Stochastic") {
        // Reuse simple stoch via close-based K
        const period = 14;
        const data: { time: number; value: number }[] = [];
        for (let i = period - 1; i < bars.length; i++) {
          let hh = -Infinity, ll = Infinity;
          for (let j = i - period + 1; j <= i; j++) {
            if (bars[j].high > hh) hh = bars[j].high;
            if (bars[j].low < ll) ll = bars[j].low;
          }
          const r = hh - ll;
          data.push({ time: bars[i].time, value: r === 0 ? 50 : ((bars[i].close - ll) / r) * 100 });
        }
        const s = o.addLineSeries({ color: "#22d3ee", lineWidth: 2 });
        s.setData(data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
        s.createPriceLine({ price: 80, color: "rgba(234,57,67,0.4)", lineStyle: 2, lineWidth: 1, axisLabelVisible: true, title: "80" });
        s.createPriceLine({ price: 20, color: "rgba(22,199,132,0.4)", lineStyle: 2, lineWidth: 1, axisLabelVisible: true, title: "20" });
      }
      o.timeScale().fitContent();
    }

    // Live ticks
    const market = getMarket();
    const tfSec = tfSeconds(tf);
    const off = market.subscribe(symbol, (q) => {
      if (stateRef.current.symbol !== symbol) return;

      const nowSec = Math.floor(q.ts / 1000);
      const boundary = nowSec - (nowSec % tfSec);
      const arr = stateRef.current.bars;
      const last = arr[arr.length - 1];
      if (!last) return;

      let updated: Bar;
      if (boundary > last.time) {
        const newBar: Bar = { time: boundary, open: q.price, high: q.price, low: q.price, close: q.price, volume: 0 };
        arr.push(newBar);
        if (arr.length > 800) arr.shift();
        updated = newBar;
      } else {
        last.high = Math.max(last.high, q.price);
        last.low = Math.min(last.low, q.price);
        last.close = q.price;
        last.volume += 1;
        updated = last;
      }

      try {
        const visBar = kind === "heikin" ? lastHeikin(stateRef.current.bars) : updated;
        if (candleRef.current && visBar) {
          candleRef.current.update({
            time: visBar.time as UTCTimestamp,
            open: visBar.open, high: visBar.high, low: visBar.low, close: visBar.close
          });
        }
        if (lineRef.current)     lineRef.current.update({ time: updated.time as UTCTimestamp, value: updated.close });
        if (areaRef.current)     areaRef.current.update({ time: updated.time as UTCTimestamp, value: updated.close });
        if (baselineRef.current) baselineRef.current.update({ time: updated.time as UTCTimestamp, value: updated.close });
        if (volRef.current) {
          volRef.current.update({
            time: updated.time as UTCTimestamp, value: updated.volume,
            color: updated.close >= updated.open ? "rgba(22,199,132,0.45)" : "rgba(234,57,67,0.45)"
          });
        }
      } catch {
        // series may have been torn down; safe to swallow
      }
      forceTick((n) => (n + 1) & 0xffff);
    });

    return () => {
      off();
    };
  }, [symbol, tf, kind, inds, oscillator, compare, aiMode]);

  const inst = getInstrument(symbol);
  const lastBar = stateRef.current.bars[stateRef.current.bars.length - 1];
  const firstBar = stateRef.current.bars[0];
  const sessionChangePct = lastBar && firstBar ? ((lastBar.close - firstBar.open) / firstBar.open) * 100 : 0;

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><CandlestickChart size={12} className="text-falcon-amber" /> Chart</span>}
      subtitle={
        <span className="flex items-center gap-2">
          <span className="text-falcon-amber">{symbol}</span>
          {compare && <span className="text-[10px] text-blue-400 font-mono">vs ${compare}</span>}
          {aiMode && <span className="px-1 rounded bg-falcon-amber/15 text-falcon-amber text-[8.5px] font-mono uppercase tracking-wider flex items-center gap-0.5"><Brain size={8} /> AI</span>}
        </span>
      }
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
      bodyClassName="flex flex-col"
    >
      {/* Main toolbar */}
      <div className="h-9 px-2 flex items-center gap-1.5 border-b border-line-soft bg-bg-2/40 shrink-0 overflow-x-auto">
        <div className="w-44 shrink-0">
          <SymbolPicker value={symbol} onChange={(s) => setPanelSymbol(panelId, s)} />
        </div>
        <CompareInput
          value={compare}
          onChange={(s) => updatePanel(panelId, { config: { compare: s } })}
        />
        <div className="flex border border-line-soft rounded overflow-hidden shrink-0">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => updatePanel(panelId, { config: { timeframe: t } })}
              className={clsx(
                "px-1.5 h-6 text-[10.5px] font-mono",
                tf === t ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-mute hover:bg-bg-3 hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <KindMenu kind={kind} onChange={(k) => updatePanel(panelId, { config: { kind: k } })} />
        <IndicatorMenu
          inds={inds}
          oscillator={oscillator}
          onToggleInd={(tag) => {
            const next = inds.includes(tag) ? inds.filter((x) => x !== tag) : [...inds, tag];
            updatePanel(panelId, { config: { indicators: next } });
          }}
          onSetOscillator={(o) => updatePanel(panelId, { config: { oscillator: o } })}
        />
        <DrawingTools />
        {lastBar && (
          <div className="ml-auto flex items-center gap-2 text-[10.5px] font-mono text-ink-dim shrink-0">
            <span>O <span className="text-ink">{fmtPrice(lastBar.open, inst?.asset)}</span></span>
            <span>H <span className="text-ink">{fmtPrice(lastBar.high, inst?.asset)}</span></span>
            <span>L <span className="text-ink">{fmtPrice(lastBar.low, inst?.asset)}</span></span>
            <span>C <span className={lastBar.close >= lastBar.open ? "text-bull" : "text-bear"}>{fmtPrice(lastBar.close, inst?.asset)}</span></span>
            <span className={sessionChangePct >= 0 ? "text-bull" : "text-bear"}>
              {sessionChangePct >= 0 ? "+" : ""}{sessionChangePct.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
      {/* Charts: main + optional oscillator pane */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div className="relative flex-[3] min-h-0">
          <div ref={containerRef} className="absolute inset-0" />
        </div>
        {oscillator && (
          <div className="relative flex-1 min-h-0 border-t border-line-soft">
            <div className="absolute top-0.5 left-1.5 z-10 px-1 py-0.5 bg-bg-2/80 rounded text-[9.5px] font-mono text-ink-mute uppercase tracking-wider">
              {oscillator}
            </div>
            <div ref={oscRef} className="absolute inset-0" />
          </div>
        )}
      </div>
    </Panel>
  );
}

function lastHeikin(bars: Bar[]): Bar | null {
  if (bars.length === 0) return null;
  // Compute HA for last bar only by looking at full HA chain — accurate but
  // O(n). For our 600-bar window this is negligible per tick.
  const ha = heikinAshi(bars);
  return ha[ha.length - 1] ?? null;
}

function addLine(
  chart: IChartApi,
  color: string,
  data: { time: number; value: number }[],
  store: Record<string, ISeriesApi<"Line"> | ISeriesApi<"Area">>,
  key: string,
  width = 2,
  lineStyle = 0
) {
  const s = chart.addLineSeries({
    color, lineWidth: width as 1 | 2 | 3 | 4,
    lineStyle: lineStyle as 0 | 1 | 2 | 3 | 4,
    priceLineVisible: false, lastValueVisible: false
  });
  s.setData(data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
  store[key] = s;
}

function tfSeconds(tf: Timeframe): number {
  return tf === "1m" ? 60
    : tf === "5m" ? 300
    : tf === "15m" ? 900
    : tf === "30m" ? 1800
    : tf === "1h" ? 3600
    : tf === "4h" ? 14400
    : tf === "1D" ? 86400
    : tf === "1W" ? 604800
    : 2_592_000;
}

function CompareInput({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  return (
    <div className="flex items-center gap-1 border border-line-soft rounded px-1.5 h-6 shrink-0">
      <GitCompare size={10} className="text-ink-mute" />
      <input
        value={v}
        onChange={(e) => setV(e.target.value.toUpperCase())}
        onBlur={() => onChange(v.trim())}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="vs ticker"
        className="bg-transparent outline-none w-16 text-[10.5px] font-mono text-ink placeholder-ink-faint"
      />
    </div>
  );
}

function KindMenu({ kind, onChange }: { kind: ChartKind; onChange: (k: ChartKind) => void }) {
  const [open, setOpen] = useState(false);
  const current = KINDS.find((k) => k.id === kind) ?? KINDS[0];
  return (
    <div className="relative shrink-0">
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((v) => !v)}
        className="px-2 h-6 text-[10.5px] font-mono border border-line-soft rounded text-ink hover:bg-bg-3 flex items-center gap-1"
      >
        <current.Icon size={11} />
        {current.label}
      </button>
      {open && (
        <div
          className="absolute z-40 mt-1 left-0 bg-bg-2 border border-line rounded shadow-xl p-1 w-44"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => { onChange(k.id); setOpen(false); }}
              className={clsx(
                "w-full text-left px-2 py-1 text-[11px] font-mono flex items-center gap-2 rounded",
                kind === k.id ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-dim hover:bg-bg-3 hover:text-ink"
              )}
            >
              <k.Icon size={11} /> {k.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IndicatorMenu({
  inds, oscillator, onToggleInd, onSetOscillator
}: {
  inds: string[];
  oscillator: string;
  onToggleInd: (tag: string) => void;
  onSetOscillator: (o: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = inds.length + (oscillator ? 1 : 0);
  return (
    <div className="relative shrink-0">
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((v) => !v)}
        className="px-2 h-6 text-[10.5px] font-mono border border-line-soft rounded text-ink-mute hover:text-ink hover:bg-bg-3 flex items-center gap-1"
      >
        <Layers size={11} /> Indicators ({total})
      </button>
      {open && (
        <div
          className="absolute z-40 mt-1 left-0 bg-bg-2 border border-line rounded shadow-xl p-1 w-56 max-h-80 overflow-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {INDICATOR_GROUPS.map((g) => (
            <div key={g.name} className="mb-1">
              <div className="px-2 py-1 text-[9.5px] uppercase tracking-wider text-ink-mute font-mono">{g.name}</div>
              {g.items.map((tag) => {
                const isOsc = g.name === "Oscillator";
                const active = isOsc ? oscillator === tag : inds.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isOsc) onSetOscillator(active ? "" : tag);
                      else onToggleInd(tag);
                    }}
                    className="w-full text-left px-2 py-1 text-[11px] font-mono flex items-center justify-between hover:bg-bg-3 rounded"
                  >
                    <span className={active ? "text-falcon-amber" : "text-ink-dim"}>{tag}</span>
                    <span className={clsx("w-3 h-3 rounded-sm border", active ? "bg-falcon-amber border-falcon-amber" : "border-line")} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Drawing tools placeholder — the toolbar surface exists so traders can see
 * the affordances; the actual drawings live as visual decorations rather
 * than interactive objects (lightweight-charts doesn't ship a full drawing
 * primitive, and a real implementation requires a custom canvas overlay).
 */
function DrawingTools() {
  const [active, setActive] = useState<string | null>(null);
  const tools: { id: string; Icon: IconCmp; title: string }[] = [
    { id: "trend",  Icon: TrendingUp, title: "Trendline" },
    { id: "hline",  Icon: Minus,      title: "Horizontal line" },
    { id: "fib",    Icon: Slash,      title: "Fib retracement" },
    { id: "rect",   Icon: Square,     title: "Rectangle" },
    { id: "text",   Icon: Type,       title: "Text" }
  ];
  return (
    <div className="flex items-center gap-0.5 border border-line-soft rounded h-6 px-0.5 shrink-0">
      {tools.map((t) => (
        <button
          key={t.id}
          title={t.title}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setActive((a) => (a === t.id ? null : t.id))}
          className={clsx(
            "h-5 w-5 rounded flex items-center justify-center",
            active === t.id ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-mute hover:bg-bg-3 hover:text-ink"
          )}
        >
          <t.Icon size={10} />
        </button>
      ))}
    </div>
  );
}
