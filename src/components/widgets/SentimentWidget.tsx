"use client";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { SymbolPicker } from "../ui/SymbolPicker";
import { useWorkspace } from "@/store/workspace";
import { generateSocialPosts, sentimentSummary } from "@/lib/news";
import { SocialPost } from "@/lib/types";
import { Flame, MessageCircle, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { INSTRUMENTS } from "@/lib/instruments";

export function SentimentWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];
  const symbol = (panel?.config.symbol as string) ?? "NVDA";

  const [posts, setPosts] = useState<SocialPost[]>([]);
  useEffect(() => {
    setPosts(generateSocialPosts(140));
    const id = setInterval(() => {
      const fresh = generateSocialPosts(1);
      fresh[0].ts = Date.now();
      setPosts((prev) => [fresh[0], ...prev].slice(0, 200));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const symbolPosts = useMemo(() => posts.filter((p) => p.symbols.includes(symbol)), [posts, symbol]);
  const summary = sentimentSummary(symbol, posts);

  // Trending — based on velocity
  const trending = useMemo(() => {
    const equities = INSTRUMENTS.filter((i) => i.asset === "equity").slice(0, 30);
    return equities
      .map((i) => ({ sym: i.symbol, ...sentimentSummary(i.symbol, posts) }))
      .filter((x) => x.mentions24h > 0)
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 8);
  }, [posts]);

  const dial = Math.max(-1, Math.min(1, summary.score));

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><MessageCircle size={12} className="text-falcon-amber" /> Sentiment</span>}
      subtitle={<span className="text-falcon-amber">{symbol}</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col">
        <div className="p-2 border-b border-line-soft">
          <SymbolPicker value={symbol} onChange={(s) => setPanelSymbol(panelId, s)} />
        </div>
        <div className="px-3 py-3 border-b border-line-soft grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9.5px] uppercase text-ink-mute mb-2 tracking-wider">Net sentiment</div>
            <SentimentDial value={dial} />
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <Stat label="1h mentions" value={summary.mentions1h.toString()} />
            <Stat label="24h mentions" value={summary.mentions24h.toString()} />
            <Stat label="Velocity" value={summary.velocity.toFixed(2) + "×"} hot={summary.velocity > 3} />
            <Stat label="Posts found" value={symbolPosts.length.toString()} />
          </div>
        </div>
        <div className="px-3 py-2 border-b border-line-soft">
          <div className="text-[9.5px] uppercase text-ink-mute mb-1.5 tracking-wider flex items-center gap-1">
            <Flame size={10} className="text-falcon-orange" /> Trending now
          </div>
          <div className="flex flex-wrap gap-1">
            {trending.map((t) => (
              <button
                key={t.sym}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setPanelSymbol(panelId, t.sym)}
                className={clsx(
                  "text-[10.5px] font-mono px-1.5 py-0.5 rounded border",
                  t.score > 0
                    ? "border-bull/40 text-bull bg-bull/5 hover:bg-bull/10"
                    : "border-bear/40 text-bear bg-bear/5 hover:bg-bear/10"
                )}
              >
                ${t.sym} <span className="text-ink-mute">{t.velocity.toFixed(1)}×</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto divide-y divide-line-soft/40">
          {symbolPosts.slice(0, 60).map((p) => (
            <PostRow key={p.id} post={p} />
          ))}
          {symbolPosts.length === 0 && <div className="p-4 text-center text-ink-mute text-[11px]">No posts yet for ${symbol}.</div>}
        </div>
      </div>
    </Panel>
  );
}

function Stat({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-ink-mute uppercase text-[9.5px] tracking-wider">{label}</span>
      <span className={clsx(hot ? "text-falcon-orange font-bold" : "text-ink")}>{value}</span>
    </div>
  );
}

function PostRow({ post }: { post: SocialPost }) {
  const positive = post.sentiment > 0.1;
  const negative = post.sentiment < -0.1;
  return (
    <div className="px-3 py-1.5">
      <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-ink-mute uppercase tracking-wider">
        <span className="text-ink-dim">{post.author}</span>
        <span>·</span>
        <span>{post.platform}</span>
        <span className="ml-auto">{new Date(post.ts).toLocaleTimeString([], { hour12: false })}</span>
        <span
          className={clsx(
            "px-1 py-px rounded text-[8.5px] font-bold",
            positive ? "bg-bull/15 text-bull" : negative ? "bg-bear/15 text-bear" : "bg-bg-3 text-ink-dim"
          )}
        >
          {positive ? "BULL" : negative ? "BEAR" : "NEUT"}
        </span>
      </div>
      <div className="text-[11.5px] text-ink mt-0.5 leading-snug">{post.body}</div>
    </div>
  );
}

function SentimentDial({ value }: { value: number }) {
  // value -1..1 mapped to 0..180 deg
  const angle = (value + 1) * 90; // -1 -> 0, +1 -> 180
  const r = 60;
  const cx = 80, cy = 70;
  const radians = (180 - angle) * (Math.PI / 180);
  const px = cx + r * Math.cos(radians);
  const py = cy - r * Math.sin(radians);
  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="84" viewBox="0 0 160 84">
        <defs>
          <linearGradient id="sentGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#ea3943" />
            <stop offset="50%" stopColor="#9aa3b2" />
            <stop offset="100%" stopColor="#16c784" />
          </linearGradient>
        </defs>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="url(#sentGrad)" strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#ffb020" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="#ffb020" />
      </svg>
      <div className="text-[16px] font-bold font-mono mt-1">
        <span className={value > 0 ? "text-bull" : value < 0 ? "text-bear" : "text-ink"}>
          {(value * 100).toFixed(0)}
        </span>
      </div>
      <div className="text-[9.5px] uppercase text-ink-mute tracking-wider">
        {value > 0.3 ? "Bullish" : value < -0.3 ? "Bearish" : "Neutral"}
      </div>
    </div>
  );
}
