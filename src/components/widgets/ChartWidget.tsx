"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  UTCTimestamp
} from "lightweight-charts";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { generateBars, fmtPrice, getMarket } from "@/lib/market";
import { ema, sma, vwap, bollinger } from "@/lib/indicators";
import { Bar, Timeframe } from "@/lib/types";
import { getInstrument } from "@/lib/instruments";
import clsx from "clsx";
import { CandlestickChart, LineChart, BarChart3, Maximize2 } from "lucide-react";

type ChartKind = "candle" | "line" | "area";
const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"];
const INDICATOR_OPTIONS = ["EMA20", "EMA50", "EMA200", "SMA200", "VWAP", "Bollinger"];

export function ChartWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const updatePanel = useWorkspace((s) => s.updatePanel);
  const removePanel = useWorkspace((s) => s.removePanel);
  const setGroup = useWorkspace((s) => s.setPanelGroup);

  const panel = ws.panels[panelId];
  const symbol = (panel?.config.symbol as string) ?? "AAPL";
  const tf = (panel?.config.timeframe as Timeframe) ?? "5m";
  const inds = useMemo<string[]>(
    () => (panel?.config.indicators as string[]) ?? ["EMA20", "EMA50", "VWAP"],
    [panel?.config.indicators]
  );
  const kind = (panel?.config.kind as ChartKind) ?? "candle";

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const areaRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const indSeriesRef = useRef<Record<string, ISeriesApi<"Line">>>({});
  const stateRef = useRef<{ symbol: string; tf: Timeframe; bars: Bar[] }>({
    symbol: "",
    tf: "5m",
    bars: []
  });
  const [, forceTick] = useState(0); // re-render to refresh OHLC readout

  // Build chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#0b0f16" },
        textColor: "#9aa3b2",
        fontSize: 11,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" }
      },
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
      volRef.current = null;
      indSeriesRef.current = {};
    };
  }, []);

  /**
   * One unified effect for symbol / timeframe / kind / indicators changes:
   *  1) tear down previous series
   *  2) generate fresh bars and create new series
   *  3) subscribe to live ticks for the current symbol
   *  4) return a cleanup that BOTH removes the subscription AND tears the series
   *
   * Putting all of this in one effect (rather than splitting into two) was the
   * root cause of the "chart doesn't update when I change symbol" bug — under
   * specific React effect-ordering scenarios the live-tick subscription could
   * end up bound to a series ref that was about to be replaced by a parallel
   * effect. With one effect, the closure always sees the latest series.
   */
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // ---- 1) Tear down any previous series ----
    if (candleRef.current) { chart.removeSeries(candleRef.current); candleRef.current = null; }
    if (lineRef.current) { chart.removeSeries(lineRef.current); lineRef.current = null; }
    if (areaRef.current) { chart.removeSeries(areaRef.current); areaRef.current = null; }
    if (volRef.current) { chart.removeSeries(volRef.current); volRef.current = null; }
    Object.values(indSeriesRef.current).forEach((s) => {
      try { chart.removeSeries(s); } catch { /* already removed */ }
    });
    indSeriesRef.current = {};

    // ---- 2) Generate new bars + series ----
    const bars = generateBars(symbol, tf, 600);
    stateRef.current = { symbol, tf, bars };

    if (kind === "candle") {
      const s = chart.addCandlestickSeries({
        upColor: "#16c784", downColor: "#ea3943",
        borderUpColor: "#16c784", borderDownColor: "#ea3943",
        wickUpColor: "#16c784", wickDownColor: "#ea3943",
        priceLineColor: "#ffb020"
      });
      s.setData(
        bars.map((b) => ({
          time: b.time as UTCTimestamp,
          open: b.open, high: b.high, low: b.low, close: b.close
        })) as CandlestickData[]
      );
      candleRef.current = s;
    } else if (kind === "line") {
      const s = chart.addLineSeries({ color: "#ffb020", lineWidth: 2, priceLineColor: "#ffb020" });
      s.setData(bars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })) as LineData[]);
      lineRef.current = s;
    } else {
      const s = chart.addAreaSeries({
        topColor: "rgba(255,176,32,0.45)",
        bottomColor: "rgba(255,176,32,0.02)",
        lineColor: "#ffb020",
        lineWidth: 2
      });
      s.setData(bars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })) as LineData[]);
      areaRef.current = s;
    }

    const vol = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: "rgba(154,163,178,0.4)"
    });
    vol.setData(
      bars.map((b) => ({
        time: b.time as UTCTimestamp,
        value: b.volume,
        color: b.close >= b.open ? "rgba(22,199,132,0.45)" : "rgba(234,57,67,0.45)"
      })) as HistogramData[]
    );
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
      borderVisible: false
    });
    volRef.current = vol;

    // Indicators
    inds.forEach((tag) => {
      let series: ISeriesApi<"Line"> | null = null;
      if (tag === "EMA20") {
        series = chart.addLineSeries({ color: "#22d3ee", lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
        series.setData(ema(bars, 20).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
      } else if (tag === "EMA50") {
        series = chart.addLineSeries({ color: "#a855f7", lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
        series.setData(ema(bars, 50).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
      } else if (tag === "EMA200") {
        series = chart.addLineSeries({ color: "#ec4899", lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
        series.setData(ema(bars, 200).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
      } else if (tag === "SMA200") {
        series = chart.addLineSeries({ color: "#eab308", lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
        series.setData(sma(bars, 200).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
      } else if (tag === "VWAP") {
        series = chart.addLineSeries({ color: "#f97316", lineWidth: 2, lineStyle: 0, priceLineVisible: false, lastValueVisible: false });
        series.setData(vwap(bars).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
      } else if (tag === "Bollinger") {
        const b = bollinger(bars, 20, 2);
        const upS = chart.addLineSeries({ color: "rgba(255,255,255,0.35)", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        const loS = chart.addLineSeries({ color: "rgba(255,255,255,0.35)", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        const midS = chart.addLineSeries({ color: "rgba(255,255,255,0.18)", lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
        upS.setData(b.upper.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
        loS.setData(b.lower.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
        midS.setData(b.middle.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
        indSeriesRef.current[`${tag}_upper`] = upS;
        indSeriesRef.current[`${tag}_lower`] = loS;
        indSeriesRef.current[`${tag}_mid`] = midS;
      }
      if (series) indSeriesRef.current[tag] = series;
    });

    chart.timeScale().fitContent();

    // ---- 3) Subscribe to live ticks for THIS symbol ----
    const market = getMarket();
    const tfSec = tfSeconds(tf);
    const off = market.subscribe(symbol, (q) => {
      // The closure is bound to `symbol` — but we also defensively check that
      // stateRef still matches before mutating, so any in-flight callback from
      // a prior subscription (extremely rare) is a no-op.
      if (stateRef.current.symbol !== symbol) return;

      const nowSec = Math.floor(q.ts / 1000);
      const boundary = nowSec - (nowSec % tfSec);
      const arr = stateRef.current.bars;
      const last = arr[arr.length - 1];
      if (!last) return;

      let updated: Bar;
      if (boundary > last.time) {
        const newBar: Bar = {
          time: boundary,
          open: q.price,
          high: q.price,
          low: q.price,
          close: q.price,
          volume: 0
        };
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
        if (candleRef.current) {
          candleRef.current.update({
            time: updated.time as UTCTimestamp,
            open: updated.open, high: updated.high, low: updated.low, close: updated.close
          });
        }
        if (lineRef.current) lineRef.current.update({ time: updated.time as UTCTimestamp, value: updated.close });
        if (areaRef.current) areaRef.current.update({ time: updated.time as UTCTimestamp, value: updated.close });
        if (volRef.current) {
          volRef.current.update({
            time: updated.time as UTCTimestamp,
            value: updated.volume,
            color: updated.close >= updated.open ? "rgba(22,199,132,0.45)" : "rgba(234,57,67,0.45)"
          });
        }
      } catch {
        // The series may have been torn down between event firing and update;
        // safe to swallow because the new effect will re-bind shortly.
      }

      // throttled re-render for the OHLC readout in the toolbar
      forceTick((n) => (n + 1) & 0xffff);
    });

    return () => {
      off();
    };
  }, [symbol, tf, kind, inds]);

  const inst = getInstrument(symbol);
  const lastBar = stateRef.current.bars[stateRef.current.bars.length - 1];

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><CandlestickChart size={12} className="text-falcon-amber" /> Chart</span>}
      subtitle={<span className="text-falcon-amber">{symbol}</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
      bodyClassName="flex flex-col"
    >
      {/* Toolbar */}
      <div className="h-9 px-2 flex items-center gap-2 border-b border-line-soft bg-bg-2/40 shrink-0">
        <div className="w-44">
          <SymbolPicker value={symbol} onChange={(s) => setPanelSymbol(panelId, s)} />
        </div>
        <div className="flex border border-line-soft rounded overflow-hidden">
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
        <div className="flex border border-line-soft rounded overflow-hidden">
          {([
            ["candle", CandlestickChart],
            ["line", LineChart],
            ["area", BarChart3]
          ] as const).map(([k, Icon]) => (
            <button
              key={k}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => updatePanel(panelId, { config: { kind: k } })}
              className={clsx(
                "px-1.5 h-6 flex items-center justify-center",
                kind === k ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-mute hover:bg-bg-3 hover:text-ink"
              )}
              title={k}
            >
              <Icon size={11} />
            </button>
          ))}
        </div>
        <IndicatorMenu
          inds={inds}
          onToggle={(tag) => {
            const next = inds.includes(tag) ? inds.filter((x) => x !== tag) : [...inds, tag];
            updatePanel(panelId, { config: { indicators: next } });
          }}
        />
        {lastBar && (
          <div className="ml-auto flex items-center gap-2 text-[10.5px] font-mono text-ink-dim">
            <span>O <span className="text-ink">{fmtPrice(lastBar.open, inst?.asset)}</span></span>
            <span>H <span className="text-ink">{fmtPrice(lastBar.high, inst?.asset)}</span></span>
            <span>L <span className="text-ink">{fmtPrice(lastBar.low, inst?.asset)}</span></span>
            <span>C <span className={lastBar.close >= lastBar.open ? "text-bull" : "text-bear"}>{fmtPrice(lastBar.close, inst?.asset)}</span></span>
          </div>
        )}
      </div>
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </Panel>
  );
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

function IndicatorMenu({ inds, onToggle }: { inds: string[]; onToggle: (tag: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((v) => !v)}
        className="px-2 h-6 text-[10.5px] font-mono border border-line-soft rounded text-ink-mute hover:text-ink hover:bg-bg-3"
      >
        Indicators ({inds.length})
      </button>
      {open && (
        <div
          className="absolute z-40 mt-1 left-0 bg-bg-2 border border-line rounded shadow-xl p-1 w-44"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {INDICATOR_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className="w-full text-left px-2 py-1 text-[11px] font-mono flex items-center justify-between hover:bg-bg-3 rounded"
            >
              <span>{tag}</span>
              <span className={clsx("w-3 h-3 rounded-sm border", inds.includes(tag) ? "bg-falcon-amber border-falcon-amber" : "border-line")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
