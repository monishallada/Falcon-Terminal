"use client";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { generateNewsBatch, getNewsStream } from "@/lib/news";
import { NewsItem } from "@/lib/types";
import { Newspaper, Filter, Zap, Brain, Sparkles } from "lucide-react";
import clsx from "clsx";

export function NewsWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const aiMode = useWorkspace((s) => s.ui.aiMode);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const panel = ws.panels[panelId];
  const filterSymbol = panel?.config.symbol as string | undefined;
  const filterMode = (panel?.config.filter as string) ?? "all";

  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    setNews(generateNewsBatch(60));
    const stream = getNewsStream();
    const off = stream.subscribe((item) => {
      setNews((prev) => [item, ...prev].slice(0, 200));
    });
    return off;
  }, []);

  const filtered = useMemo(() => {
    return news.filter((n) => {
      if (filterSymbol && !n.symbols.includes(filterSymbol)) return false;
      if (filterMode === "breaking" && n.urgency !== "breaking") return false;
      if (filterMode === "bullish" && n.sentiment <= 0.2) return false;
      if (filterMode === "bearish" && n.sentiment >= -0.2) return false;
      return true;
    });
  }, [news, filterSymbol, filterMode]);

  // AI digest — synthesized from the top N filtered headlines
  const digest = useMemo(() => buildDigest(filtered.slice(0, 25)), [filtered]);

  return (
    <Panel
      title={
        <span className="flex items-center gap-1.5">
          <Newspaper size={12} className="text-falcon-amber" /> News
          {aiMode && (
            <span className="px-1 rounded bg-falcon-amber/15 text-falcon-amber text-[8.5px] font-mono uppercase tracking-wider flex items-center gap-0.5">
              <Brain size={8} /> AI
            </span>
          )}
        </span>
      }
      subtitle={filterSymbol ? <span className="text-falcon-amber">{filterSymbol}</span> : undefined}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col">
        <div className="px-2 py-1.5 border-b border-line-soft bg-bg-2/50 flex items-center gap-1 text-[10.5px]">
          <Filter size={11} className="text-ink-mute" />
          {(["all", "breaking", "bullish", "bearish"] as const).map((m) => (
            <button
              key={m}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => useWorkspace.getState().updatePanel(panelId, { config: { filter: m } })}
              className={clsx(
                "px-2 py-0.5 rounded uppercase tracking-wider font-mono",
                filterMode === m ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-mute hover:bg-bg-3 hover:text-ink"
              )}
            >
              {m}
            </button>
          ))}
          {filterSymbol && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => useWorkspace.getState().updatePanel(panelId, { config: { symbol: undefined } })}
              className="ml-auto px-2 py-0.5 rounded text-ink-mute hover:bg-bg-3 hover:text-ink"
            >
              Clear {filterSymbol} ×
            </button>
          )}
        </div>

        {aiMode && digest && (
          <div className="border-b border-falcon-amber/20 bg-falcon-amber/[0.04] px-2 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={10} className="text-falcon-amber" />
              <span className="text-[9.5px] uppercase tracking-wider text-falcon-amber font-mono">
                AI Digest · last {digest.scanned} headlines
              </span>
              <span className="ml-auto text-[9.5px] font-mono text-ink-dim">
                Bias: <span className={digest.netSentiment > 0.1 ? "text-bull" : digest.netSentiment < -0.1 ? "text-bear" : "text-ink"}>
                  {digest.netSentiment > 0.1 ? "Bullish" : digest.netSentiment < -0.1 ? "Bearish" : "Mixed"}
                </span>
              </span>
            </div>
            <ul className="space-y-0.5 text-[11px] text-ink-dim leading-snug">
              {digest.themes.map((t, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-falcon-amber/80 shrink-0 font-mono text-[10px]">›</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            {digest.topTickers.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {digest.topTickers.map((t) => (
                  <button
                    key={t.sym}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setPanelSymbol(panelId, t.sym)}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-3 hover:bg-falcon-amber/15 hover:text-falcon-amber text-ink-dim flex items-center gap-1"
                  >
                    ${t.sym} <span className="text-ink-mute">{t.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-auto divide-y divide-line-soft/40">
          {filtered.map((n) => (
            <NewsRow
              key={n.id}
              item={n}
              ai={aiMode}
              onSymbolClick={(s) => setPanelSymbol(panelId, s)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-ink-mute text-[11px]">No matching news.</div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function NewsRow({ item, ai, onSymbolClick }: { item: NewsItem; ai: boolean; onSymbolClick: (s: string) => void }) {
  const sent = item.sentiment;
  const tradeRead = ai ? aiTradeRead(item) : null;
  return (
    <div className="px-2 py-1.5 hover:bg-bg-3/50">
      <div className="flex items-center gap-1.5 text-[9.5px] text-ink-mute font-mono uppercase tracking-wider">
        <span>{new Date(item.ts).toLocaleTimeString([], { hour12: false })}</span>
        <span>·</span>
        <span>{item.source}</span>
        <span
          className={clsx(
            "ml-auto px-1 py-px rounded text-[8.5px] font-bold",
            item.urgency === "breaking" ? "bg-bear/15 text-bear" : "bg-bg-3 text-ink-dim"
          )}
        >
          {item.urgency === "breaking" && <Zap size={9} className="inline mr-0.5" />}
          {item.urgency}
        </span>
        <span
          className={clsx(
            "px-1 py-px rounded text-[8.5px] font-bold",
            sent > 0.25 ? "bg-bull/15 text-bull" : sent < -0.25 ? "bg-bear/15 text-bear" : "bg-bg-3 text-ink-dim"
          )}
        >
          {sent > 0.25 ? "BULL" : sent < -0.25 ? "BEAR" : "NEUTRAL"}
        </span>
      </div>
      <div className="text-[12.5px] text-ink mt-0.5 leading-snug">{item.headline}</div>
      <div className="text-[11px] text-ink-dim mt-0.5 leading-snug line-clamp-2">{item.summary}</div>
      {tradeRead && (
        <div className="mt-1 flex items-start gap-1.5 px-1.5 py-1 rounded border border-falcon-amber/20 bg-falcon-amber/[0.04]">
          <Brain size={10} className="text-falcon-amber mt-0.5 shrink-0" />
          <div className="text-[10.5px] text-falcon-amber/95 leading-snug">{tradeRead}</div>
        </div>
      )}
      <div className="mt-1 flex items-center gap-1 flex-wrap">
        {item.symbols.map((s) => (
          <button
            key={s}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onSymbolClick(s)}
            className="text-[10px] font-mono px-1.5 py-px rounded bg-bg-3 hover:bg-falcon-amber/15 hover:text-falcon-amber text-ink-dim"
          >
            ${s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// AI synthesis helpers — these are deterministic readouts of the structured
// fields on each NewsItem. In production this is where a streaming LLM call
// would replace the local heuristic; the surface (a single string per item,
// a 3-bullet digest) is intentionally the same.
// ----------------------------------------------------------------------------

function aiTradeRead(n: NewsItem): string {
  const sent = n.sentiment;
  const breaking = n.urgency === "breaking";
  const sym = n.symbols[0];
  if (breaking && sent > 0.3) return `Breaking + bullish on $${sym}: watch for a momentum continuation if volume confirms in the first 15 min.`;
  if (breaking && sent < -0.3) return `Breaking + bearish on $${sym}: expect a gap or supply spike; mean-reversion plays often fail on the first test.`;
  if (sent > 0.3) return `Bullish signal for $${sym}. Useful as confirmation, not a standalone setup — pair with flow / chart context.`;
  if (sent < -0.3) return `Bearish signal for $${sym}. Look for follow-through in the tape and rising put premium before sizing.`;
  return `Headline is informational; sentiment is mixed. File under context, not catalyst.`;
}

interface Digest {
  themes: string[];
  netSentiment: number;
  scanned: number;
  topTickers: { sym: string; count: number }[];
}

function buildDigest(items: NewsItem[]): Digest | null {
  if (items.length === 0) return null;
  const counts = new Map<string, { count: number; sent: number }>();
  let breaking = 0;
  let bullCount = 0, bearCount = 0;
  let sentSum = 0;
  for (const n of items) {
    if (n.urgency === "breaking") breaking++;
    if (n.sentiment > 0.2) bullCount++;
    if (n.sentiment < -0.2) bearCount++;
    sentSum += n.sentiment;
    for (const s of n.symbols) {
      const e = counts.get(s) ?? { count: 0, sent: 0 };
      e.count += 1;
      e.sent += n.sentiment;
      counts.set(s, e);
    }
  }
  const topTickers = Array.from(counts.entries())
    .map(([sym, v]) => ({ sym, count: v.count, sent: v.sent / v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const themes: string[] = [];
  if (breaking > 0) themes.push(`${breaking} breaking headline${breaking > 1 ? "s" : ""} in the window — elevated event risk.`);
  if (bullCount > bearCount + 2) themes.push(`Tone skews bullish (${bullCount} positive vs ${bearCount} negative).`);
  else if (bearCount > bullCount + 2) themes.push(`Tone skews bearish (${bearCount} negative vs ${bullCount} positive).`);
  else themes.push(`Tone is mixed (${bullCount} bull / ${bearCount} bear / ${items.length - bullCount - bearCount} neutral).`);
  if (topTickers.length > 0) {
    const top = topTickers[0];
    themes.push(`Most-mentioned: $${top.sym} (${top.count} headlines, avg ${top.sent > 0 ? "+" : ""}${top.sent.toFixed(2)} sentiment).`);
  }
  return {
    themes,
    netSentiment: sentSum / items.length,
    scanned: items.length,
    topTickers: topTickers.map(({ sym, count }) => ({ sym, count }))
  };
}
