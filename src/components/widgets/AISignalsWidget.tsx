"use client";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { generateBars, fmtPrice, getMarket } from "@/lib/market";
import { aiSignal, AISignalResult } from "@/lib/indicators";
import { getInstrument } from "@/lib/instruments";
import { Brain, TrendingUp, TrendingDown, Minus, ShieldAlert, Target } from "lucide-react";
import clsx from "clsx";

/**
 * AI Signals — a compact dashboard that runs the composite `aiSignal` model
 * on the active symbol and renders a 0-100 score, regime, recommendation,
 * feature snapshot, and ATR-based trade plan. Updates live on every tick.
 */
export function AISignalsWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);

  const panel = ws.panels[panelId];
  const symbol = (panel?.config.symbol as string) ?? "NVDA";

  // Generate base bars + recompute signal on each tick (cheap enough on 200 bars)
  const [signal, setSignal] = useState<AISignalResult | null>(null);
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    const bars = generateBars(symbol, "5m", 240);
    const compute = () => {
      const sig = aiSignal(bars);
      setSignal(sig);
      const last = bars[bars.length - 1];
      if (last) setPrice(last.close);
    };
    compute();
    const market = getMarket();
    const off = market.subscribe(symbol, (q) => {
      const last = bars[bars.length - 1];
      if (!last) return;
      last.close = q.price;
      last.high = Math.max(last.high, q.price);
      last.low = Math.min(last.low, q.price);
      compute();
    });
    return off;
  }, [symbol]);

  const inst = getInstrument(symbol);
  const action = signal?.action ?? "HOLD";
  const score = signal?.score ?? 50;
  const conf = signal?.confidence ?? 0;

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Brain size={12} className="text-falcon-amber" /> AI Signals</span>}
      subtitle={<span className="text-falcon-amber">{symbol}</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
      bodyClassName="flex flex-col overflow-hidden"
    >
      {/* Symbol picker */}
      <div className="h-9 px-2 flex items-center gap-2 border-b border-line-soft bg-bg-2/40 shrink-0">
        <div className="w-44">
          <SymbolPicker value={symbol} onChange={(s) => setPanelSymbol(panelId, s)} />
        </div>
        <div className="ml-auto text-[10.5px] font-mono text-ink-dim">
          {fmtPrice(price, inst?.asset)}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Score + action */}
        <div className="grid grid-cols-2 gap-2">
          <ScoreDial score={score} action={action} />
          <ActionPanel action={action} confidence={conf} regime={signal?.regime ?? "range"} />
        </div>

        {/* Features grid */}
        {signal && (
          <FeaturesGrid features={signal.features} />
        )}

        {/* Reasoning */}
        {signal && signal.reasons.length > 0 && (
          <div className="border border-line-soft rounded">
            <div className="px-2 py-1.5 border-b border-line-soft bg-bg-2/40 text-[9.5px] uppercase tracking-wider text-ink-mute font-mono">
              Why · {signal.reasons.length} signals fired
            </div>
            <ul className="divide-y divide-line-soft/40">
              {signal.reasons.map((r, i) => (
                <li key={i} className="px-2 py-1.5 flex items-start gap-2">
                  <span
                    className={clsx(
                      "shrink-0 mt-0.5 w-1 h-3.5 rounded-sm",
                      r.score > 0.1 ? "bg-bull" : r.score < -0.1 ? "bg-bear" : "bg-ink-mute/40"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] text-ink font-medium">{r.label}</div>
                    <div className="text-[10.5px] text-ink-dim leading-snug">{r.detail}</div>
                  </div>
                  <span
                    className={clsx(
                      "ml-auto shrink-0 text-[9.5px] font-mono",
                      r.score > 0.1 ? "text-bull" : r.score < -0.1 ? "text-bear" : "text-ink-mute"
                    )}
                  >
                    {r.score > 0 ? "+" : ""}{r.score.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trade plan */}
        {signal && (
          <div className="border border-falcon-amber/30 rounded bg-falcon-amber/[0.04]">
            <div className="px-2 py-1.5 border-b border-falcon-amber/20 text-[9.5px] uppercase tracking-wider text-falcon-amber font-mono flex items-center gap-1.5">
              <Target size={11} /> ATR-based trade plan
            </div>
            <div className="grid grid-cols-4 gap-px bg-line-soft">
              <PlanCell label="Entry" value={fmtPrice(signal.suggestion.entry, inst?.asset)} />
              <PlanCell label="Stop"   value={fmtPrice(signal.suggestion.stop, inst?.asset)} tone="bear" />
              <PlanCell label="Target" value={fmtPrice(signal.suggestion.target, inst?.asset)} tone="bull" />
              <PlanCell label="R:R"    value={signal.suggestion.rr.toFixed(2) + "×"} tone="gold" />
            </div>
            <div className="px-2 py-1.5 text-[9.5px] text-ink-mute font-mono flex items-center gap-1">
              <ShieldAlert size={9} className="text-ink-mute" />
              Research output · not investment advice
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ScoreDial({ score, action }: { score: number; action: string }) {
  const angle = (score / 100) * 180 - 90; // -90 to +90
  const color =
    score >= 60 ? "#16c784" : score <= 40 ? "#ea3943" : "#ffb020";
  return (
    <div className="border border-line-soft rounded bg-bg-2/40 p-3 flex flex-col items-center justify-center">
      <div className="relative w-32 h-16">
        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full">
          {/* Track */}
          <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
          {/* Score arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 141} 141`}
          />
          {/* Needle */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${angle} 50 50)`}
          />
          <circle cx="50" cy="50" r="2.5" fill="#fff" />
        </svg>
      </div>
      <div className="font-mono text-[28px] leading-none mt-1" style={{ color }}>{score}</div>
      <div className="text-[9.5px] uppercase tracking-[0.2em] text-ink-mute mt-1">AI score · {action}</div>
    </div>
  );
}

function ActionPanel({
  action,
  confidence,
  regime
}: {
  action: string;
  confidence: number;
  regime: AISignalResult["regime"];
}) {
  const bullish = action.includes("BUY");
  const bearish = action.includes("SELL");
  const Icon = bullish ? TrendingUp : bearish ? TrendingDown : Minus;
  const regimeLabel = {
    trend_up: "Trending up",
    trend_down: "Trending down",
    range: "Range-bound",
    expanding_vol: "Volatility expansion"
  }[regime];
  return (
    <div className="border border-line-soft rounded bg-bg-2/40 p-3 flex flex-col">
      <div className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10.5px] font-mono uppercase tracking-wider w-fit",
        bullish ? "bg-bull/15 text-bull" : bearish ? "bg-bear/15 text-bear" : "bg-ink-mute/15 text-ink"
      )}>
        <Icon size={12} /> {action}
      </div>
      <div className="mt-2 space-y-1.5 text-[10.5px] font-mono">
        <Row k="Confidence" v={`${confidence}%`} />
        <Row k="Regime"     v={regimeLabel} />
      </div>
      <div className="mt-auto pt-2 border-t border-line-soft text-[9.5px] text-ink-mute leading-snug">
        Composite score across 9 indicators, weighted by regime strength.
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-ink-mute">{k}</span>
      <span className="text-ink">{v}</span>
    </div>
  );
}

function FeaturesGrid({ features }: { features: AISignalResult["features"] }) {
  const cells: { k: string; v: string; tone: "bull" | "bear" | "neutral" }[] = [
    { k: "RSI(14)",    v: features.rsi.toFixed(1),                tone: features.rsi >= 70 ? "bear" : features.rsi <= 30 ? "bull" : "neutral" },
    { k: "MACD hist",  v: features.macdHist.toFixed(3),            tone: features.macdHist > 0 ? "bull" : features.macdHist < 0 ? "bear" : "neutral" },
    { k: "ADX",        v: features.adx.toFixed(1),                 tone: features.adx >= 25 ? "bull" : "neutral" },
    { k: "EMA trend",  v: (features.emaTrend * 100).toFixed(2) + "%", tone: features.emaTrend > 0 ? "bull" : "bear" },
    { k: "BB %B",      v: features.bbPctB.toFixed(2),              tone: features.bbPctB > 1 ? "bear" : features.bbPctB < 0 ? "bull" : "neutral" },
    { k: "ATR %",      v: (features.atrPct * 100).toFixed(2) + "%", tone: features.atrPct > 0.02 ? "bear" : "neutral" },
    { k: "Vol z-score",v: features.volumeZ.toFixed(2) + "σ",       tone: features.volumeZ > 1.5 ? "bull" : features.volumeZ < -1 ? "bear" : "neutral" },
    { k: "SuperTrend", v: features.superTrendUp ? "Long" : "Short", tone: features.superTrendUp ? "bull" : "bear" }
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-soft border border-line-soft rounded overflow-hidden">
      {cells.map((c) => (
        <div key={c.k} className="bg-bg-2 px-2 py-1.5">
          <div className="text-[9.5px] uppercase tracking-wider text-ink-mute font-mono">{c.k}</div>
          <div
            className={clsx(
              "text-[12px] font-mono mt-0.5",
              c.tone === "bull" ? "text-bull" : c.tone === "bear" ? "text-bear" : "text-ink"
            )}
          >
            {c.v}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanCell({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" | "gold" }) {
  return (
    <div className="bg-bg-2/40 px-2 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wider text-ink-mute font-mono">{label}</div>
      <div
        className={clsx(
          "text-[12px] font-mono mt-0.5",
          tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : tone === "gold" ? "text-falcon-amber" : "text-ink"
        )}
      >
        {value}
      </div>
    </div>
  );
}
