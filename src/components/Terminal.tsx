"use client";
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "./TopBar";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { CommandPalette } from "./CommandPalette";
import { HelpDialog } from "./HelpDialog";
import { BreakingNewsBanner } from "./BreakingNewsBanner";
import { useWorkspace } from "@/store/workspace";
import { useQuotes, useNow } from "@/lib/hooks";
import { getMarket } from "@/lib/market";
import { getNewsStream } from "@/lib/news";
import { Brain, Zap, TrendingUp, TrendingDown, CircleDot } from "lucide-react";
import clsx from "clsx";

export function Terminal() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    getMarket();
    getNewsStream().start();
    return () => getNewsStream().stop();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col">
      <TopBar />
      <main className="flex-1 relative">
        {hydrated ? <WorkspaceCanvas /> : <BootSplash />}
        <BreakingNewsBanner />
      </main>
      <StatusBar />
      <CommandPalette />
      <HelpDialog />
    </div>
  );
}

function BootSplash() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg-0">
      <div className="flex flex-col items-center gap-3">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path d="M5 18 L12 4 L19 18 L16 18 L12 10 L8 18 Z" fill="#ffb020" />
        </svg>
        <div className="text-falcon-amber font-mono uppercase tracking-[0.4em] text-[11px]">
          Falcon Terminal
        </div>
        <div className="text-ink-mute font-mono text-[10px] tracking-wider uppercase">
          Booting workspace…
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  const ws = useWorkspace((s) => s.active());
  const watchlist = useWorkspace((s) => s.watchlist);
  const positions = useWorkspace((s) => s.positions);
  const aiMode = useWorkspace((s) => s.ui.aiMode);
  const now = useNow(1000);

  // Breadth proxy — % of watched names green vs red on the session
  const quotes = useQuotes(watchlist.slice(0, 20));
  const breadth = useMemo(() => {
    const items = Object.values(quotes);
    if (items.length === 0) return { advancing: 0, declining: 0, pctGreen: 0 };
    const advancing = items.filter((q) => q.changePct > 0).length;
    const declining = items.filter((q) => q.changePct < 0).length;
    return { advancing, declining, pctGreen: advancing / items.length };
  }, [quotes]);

  // Breaking news count over the last 10 min
  const [breakingCount, setBreakingCount] = useState(0);
  useEffect(() => {
    const stream = getNewsStream();
    const cutoff = () => Date.now() - 10 * 60 * 1000;
    const off = stream.subscribe((n) => {
      if (n.urgency === "breaking" && n.ts > cutoff()) {
        setBreakingCount((c) => c + 1);
      }
    });
    const tick = setInterval(() => setBreakingCount((c) => Math.max(0, c - 1)), 60_000);
    return () => { off(); clearInterval(tick); };
  }, []);

  // Market session — rough US equities clock (ET)
  const session = useMarketSession(new Date(now));

  return (
    <footer className="h-7 shrink-0 border-t border-line bg-bg-1 px-3 flex items-center text-[10px] font-mono text-ink-mute uppercase tracking-wider gap-4 overflow-x-auto">
      {/* Session */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={clsx(
          "inline-block w-1.5 h-1.5 rounded-full",
          session.state === "regular" ? "bg-bull animate-pulse" :
          session.state === "premarket" || session.state === "afterhours" ? "bg-falcon-amber" : "bg-ink-mute"
        )} />
        <span className="text-ink">{session.label}</span>
        <span className="text-ink-mute">{formatET(new Date(now))}</span>
      </div>

      {/* Breadth */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-ink-mute">Breadth</span>
        <span className="text-bull inline-flex items-center gap-0.5"><TrendingUp size={9} />{breadth.advancing}</span>
        <span className="text-ink-faint">/</span>
        <span className="text-bear inline-flex items-center gap-0.5"><TrendingDown size={9} />{breadth.declining}</span>
        <BreadthBar pct={breadth.pctGreen} />
      </div>

      {/* Breaking */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Zap size={10} className={breakingCount > 0 ? "text-bear" : "text-ink-mute"} />
        <span className="text-ink-mute">Breaking 10m</span>
        <span className={breakingCount > 0 ? "text-bear" : "text-ink-dim"}>{breakingCount}</span>
      </div>

      {/* AI mode */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Brain size={10} className={aiMode ? "text-falcon-amber animate-pulse" : "text-ink-mute"} />
        <span className="text-ink-mute">AI</span>
        <span className={aiMode ? "text-falcon-amber" : "text-ink-dim"}>{aiMode ? "Active" : "Off"}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <CircleDot size={10} className="text-falcon-amber" />
        <span className="text-ink-mute">WS</span>
        <span className="text-ink-dim">{ws.name}</span>
        <span className="text-ink-faint">·</span>
        <span className="text-ink-mute">{ws.layout.length}</span>
      </div>
      <span className="text-ink-mute shrink-0">WL <span className="text-ink-dim">{watchlist.length}</span></span>
      <span className="text-ink-mute shrink-0">POS <span className="text-ink-dim">{positions.length}</span></span>

      <span className="ml-auto text-falcon-amber/60 shrink-0">
        Falcon v1.1 · Simulated feed · Swap to Polygon/EDGAR/FRED in prod
      </span>
    </footer>
  );
}

function BreadthBar({ pct }: { pct: number }) {
  return (
    <span className="inline-block w-16 h-1.5 rounded-full bg-bear/30 overflow-hidden relative">
      <span
        className="absolute inset-y-0 left-0 bg-bull"
        style={{ width: `${Math.round(pct * 100)}%` }}
      />
    </span>
  );
}

function formatET(d: Date): string {
  // Approximate ET — we don't actually shift TZ here, just render the local
  // wall clock and tag it ET so the readout looks like a desk terminal.
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s} ET`;
}

function useMarketSession(now: Date): { state: "premarket" | "regular" | "afterhours" | "closed"; label: string } {
  const h = now.getHours() + now.getMinutes() / 60;
  const dow = now.getDay();
  if (dow === 0 || dow === 6) return { state: "closed", label: "Weekend · closed" };
  if (h >= 9.5 && h < 16) return { state: "regular",    label: "Regular session" };
  if (h >= 4 && h < 9.5)  return { state: "premarket",  label: "Pre-market" };
  if (h >= 16 && h < 20)  return { state: "afterhours", label: "After hours" };
  return { state: "closed", label: "Overnight · closed" };
}
