"use client";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { generateNewsBatch, getNewsStream } from "@/lib/news";
import { NewsItem } from "@/lib/types";
import { Newspaper, Filter, Zap } from "lucide-react";
import clsx from "clsx";

export function NewsWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const panel = ws.panels[panelId];
  const filterSymbol = panel?.config.symbol as string | undefined;
  const filterMode = (panel?.config.filter as string) ?? "all"; // all | breaking | bullish | bearish

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

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Newspaper size={12} className="text-falcon-amber" /> News</span>}
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
        <div className="flex-1 overflow-auto divide-y divide-line-soft/40">
          {filtered.map((n) => (
            <NewsRow key={n.id} item={n} onSymbolClick={(s) => setPanelSymbol(panelId, s)} />
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-ink-mute text-[11px]">No matching news.</div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function NewsRow({ item, onSymbolClick }: { item: NewsItem; onSymbolClick: (s: string) => void }) {
  const sent = item.sentiment;
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
