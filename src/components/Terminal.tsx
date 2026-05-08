"use client";
import { useEffect, useState } from "react";
import { TopBar } from "./TopBar";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { CommandPalette } from "./CommandPalette";
import { HelpDialog } from "./HelpDialog";
import { BreakingNewsBanner } from "./BreakingNewsBanner";
import { useWorkspace } from "@/store/workspace";
import { getMarket } from "@/lib/market";
import { getNewsStream } from "@/lib/news";

export function Terminal() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Workspace persist hydration is handled by the AuthGate (which knows the
    // active user's namespaced key). Just boot the data engines here.
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
  return (
    <footer className="h-6 shrink-0 border-t border-line bg-bg-1 px-3 flex items-center text-[10px] font-mono text-ink-mute uppercase tracking-wider gap-3">
      <span>WS · <span className="text-ink-dim">{ws.name}</span></span>
      <span>Panels · <span className="text-ink-dim">{ws.layout.length}</span></span>
      <span>Watchlist · <span className="text-ink-dim">{watchlist.length}</span></span>
      <span>Positions · <span className="text-ink-dim">{positions.length}</span></span>
      <span className="ml-auto text-falcon-amber/70">
        Falcon v1.0 · Simulated market data — replace with Polygon/EDGAR/FRED in prod
      </span>
    </footer>
  );
}
