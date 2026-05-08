"use client";
import { useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { useNow, useQuotes } from "@/lib/hooks";
import { fmtPct, fmtPrice, getMarket } from "@/lib/market";
import { format } from "date-fns";
import {
  Activity,
  Command,
  Plus,
  Search,
  Settings,
  Wifi,
  Zap,
  Layers as LayersIcon,
  X,
  Pause,
  Play,
  Gauge
} from "lucide-react";
import clsx from "clsx";
import { WIDGET_CATALOG } from "./widgets";
import { GroupDot } from "./ui/GroupDot";
import { UserMenu } from "./auth/UserMenu";

export function TopBar() {
  const workspaces = useWorkspace((s) => s.workspaces);
  const activeId = useWorkspace((s) => s.activeId);
  const setActive = useWorkspace((s) => s.setActive);
  const create = useWorkspace((s) => s.createWorkspace);
  const rename = useWorkspace((s) => s.renameWorkspace);
  const remove = useWorkspace((s) => s.deleteWorkspace);
  const addPanel = useWorkspace((s) => s.addPanel);
  const setUI = useWorkspace((s) => s.setUI);
  const ui = useWorkspace((s) => s.ui);

  const now = useNow(1000);
  const indices = useQuotes(["SPX", "NDX", "DJI", "VIX", "BTC"]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <header className="h-11 shrink-0 border-b border-line bg-bg-1 flex items-center px-2 gap-2 z-30 relative">
      {/* Brand */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-line-soft">
        <div className="w-6 h-6 rounded bg-falcon-amber/15 border border-falcon-amber/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path d="M5 18 L12 4 L19 18 L16 18 L12 10 L8 18 Z" fill="#ffb020" />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[12px] font-bold tracking-wider text-ink">FALCON</span>
          <span className="text-[8.5px] text-ink-mute uppercase tracking-wider">Terminal</span>
        </div>
      </div>

      {/* Workspace tabs */}
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {workspaces.map((w) => {
          const isActive = w.id === activeId;
          return (
            <div
              key={w.id}
              className={clsx(
                "group h-7 pl-2 pr-1 flex items-center gap-1 rounded text-[11px] font-mono cursor-pointer border",
                isActive ? "bg-bg-3 border-falcon-amber/40 text-ink" : "border-transparent text-ink-dim hover:text-ink hover:bg-bg-2"
              )}
              onClick={() => setActive(w.id)}
              onDoubleClick={() => { setEditing(w.id); setEditVal(w.name); }}
            >
              {editing === w.id ? (
                <input
                  autoFocus
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onBlur={() => { rename(w.id, editVal || w.name); setEditing(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { rename(w.id, editVal || w.name); setEditing(null); }
                    else if (e.key === "Escape") { setEditing(null); }
                  }}
                  className="bg-transparent outline-none w-24 border-b border-falcon-amber"
                />
              ) : (
                <>
                  <span>{w.name}</span>
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm(`Delete workspace "${w.name}"?`)) remove(w.id); }}
                      className="p-0.5 rounded text-ink-faint opacity-0 group-hover:opacity-100 hover:text-bear hover:bg-bg-3"
                      title="Delete workspace"
                    >
                      <X size={10} />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
        <button
          onClick={() => {
            const id = create("Untitled", "blank");
            setEditing(id);
            setEditVal("Untitled");
          }}
          title="New workspace"
          className="h-7 px-1.5 rounded text-ink-mute hover:text-ink hover:bg-bg-2 flex items-center"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Add Widget */}
      <div className="relative">
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="h-7 px-2 rounded bg-falcon-amber/15 border border-falcon-amber/30 text-falcon-amber hover:bg-falcon-amber/25 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1"
        >
          <Plus size={11} /> Widget
        </button>
        {showAdd && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-bg-2 border border-line rounded-md shadow-2xl z-40 max-h-[70vh] overflow-auto p-1">
            <div className="text-[9.5px] uppercase tracking-wider text-ink-mute px-2 py-1.5">Add a widget</div>
            {WIDGET_CATALOG.map((w) => (
              <button
                key={w.type}
                onClick={() => { addPanel(w.type); setShowAdd(false); }}
                className="w-full text-left px-2 py-2 hover:bg-bg-3 rounded flex items-start gap-2"
              >
                <w.icon size={14} className="text-falcon-amber mt-0.5" />
                <div>
                  <div className="text-[12px] text-ink font-semibold">{w.name}</div>
                  <div className="text-[10.5px] text-ink-mute">{w.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Index strip */}
      <div className="hidden xl:flex items-center gap-3 ml-2 pl-2 border-l border-line-soft text-[11px] font-mono">
        {[
          { sym: "SPX",  label: "S&P" },
          { sym: "NDX",  label: "NDX" },
          { sym: "DJI",  label: "DOW" },
          { sym: "VIX",  label: "VIX" },
          { sym: "BTC",  label: "BTC" }
        ].map(({ sym, label }) => {
          const q = indices[sym];
          if (!q) return null;
          const positive = q.changePct >= 0;
          return (
            <div key={sym} className="flex items-baseline gap-1">
              <span className="text-ink-mute uppercase text-[9.5px] tracking-wider">{label}</span>
              <span className="text-ink">{fmtPrice(q.price, sym === "BTC" ? "crypto" : undefined)}</span>
              <span className={clsx("text-[10px]", positive ? "text-bull" : "text-bear")}>{fmtPct(q.changePct)}</span>
            </div>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setUI({ commandOpen: true })}
          className="hidden md:flex h-7 px-2 items-center gap-1.5 rounded border border-line-soft text-ink-mute hover:text-ink hover:bg-bg-2 text-[11px] font-mono"
          title="Command palette"
        >
          <Search size={11} />
          <span>Search…</span>
          <span className="ml-1 px-1 py-px text-[9.5px] rounded bg-bg-3 text-ink-mute">⌘K</span>
        </button>
        <SpeedControl />
        <ConnectionPill />
        <div className="text-[10.5px] font-mono text-ink-dim hidden sm:block">
          {format(now, "HH:mm:ss")} <span className="text-ink-mute">ET</span>
        </div>
        <button
          onClick={() => setUI({ helpOpen: true })}
          className="h-7 w-7 rounded text-ink-mute hover:text-ink hover:bg-bg-2 flex items-center justify-center"
          title="Help & shortcuts"
        >
          <Command size={12} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

function SpeedControl() {
  const [open, setOpen] = useState(false);
  const ui = useWorkspace((s) => s.ui);
  const setUI = useWorkspace((s) => s.setUI);
  const speeds = [0, 0.5, 1, 2, 5, 10];
  function setSpeed(s: number) {
    setUI({ speed: s });
    getMarket().setSpeed(s);
  }
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "h-7 px-2 rounded border flex items-center gap-1 text-[10.5px] font-mono",
          ui.speed === 0
            ? "border-bear/40 bg-bear/10 text-bear"
            : "border-line-soft text-ink-mute hover:text-ink hover:bg-bg-2"
        )}
        title="Simulation speed"
      >
        {ui.speed === 0 ? <Pause size={11} /> : <Gauge size={11} />}
        {ui.speed}×
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-bg-2 border border-line rounded-md shadow-xl p-1 z-40">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => { setSpeed(s); setOpen(false); }}
              className={clsx(
                "w-full text-left px-3 py-1 rounded text-[11px] font-mono",
                s === ui.speed ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-dim hover:bg-bg-3"
              )}
            >
              {s === 0 ? "Pause" : s + "×"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectionPill() {
  const speed = useWorkspace((s) => s.ui.speed);
  const live = speed > 0;
  return (
    <div className={clsx(
      "h-7 px-2 rounded border flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-wider",
      live ? "border-bull/40 bg-bull/10 text-bull" : "border-bear/40 bg-bear/10 text-bear"
    )}>
      <span className="relative flex h-2 w-2">
        <span className={clsx(
          "absolute inline-flex h-full w-full rounded-full opacity-75",
          live ? "bg-bull animate-ping" : "bg-bear"
        )} />
        <span className={clsx("relative inline-flex rounded-full h-2 w-2", live ? "bg-bull" : "bg-bear")} />
      </span>
      {live ? "Live" : "Paused"}
    </div>
  );
}
