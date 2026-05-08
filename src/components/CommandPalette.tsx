"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { searchInstruments } from "@/lib/instruments";
import { WIDGET_CATALOG } from "./widgets";
import { Search, ArrowRight, Sparkles, Plus, Eye, LayoutGrid as Grid } from "lucide-react";
import clsx from "clsx";

interface Action {
  id: string;
  label: string;
  hint?: string;
  group: "Symbols" | "Widgets" | "Workspaces" | "Watchlist" | "Actions";
  run: () => void;
  icon?: React.ReactNode;
}

export function CommandPalette() {
  const open = useWorkspace((s) => s.ui.commandOpen);
  const setUI = useWorkspace((s) => s.setUI);
  const ws = useWorkspace((s) => s.active());
  const setActive = useWorkspace((s) => s.setActive);
  const workspaces = useWorkspace((s) => s.workspaces);
  const create = useWorkspace((s) => s.createWorkspace);
  const addPanel = useWorkspace((s) => s.addPanel);
  const addWatch = useWorkspace((s) => s.addToWatchlist);
  const setPreferred = useWorkspace((s) => s.setPreferredSymbol);

  const [q, setQ] = useState("");
  const [hover, setHover] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open with Cmd/Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setUI({ commandOpen: !open });
      }
      if (e.key === "Escape" && open) {
        setUI({ commandOpen: false });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setUI]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setQ("");
      setHover(0);
    }
  }, [open]);

  const actions: Action[] = useMemo(() => {
    const out: Action[] = [];

    // Symbols
    const symResults = q ? searchInstruments(q, 8) : [];
    symResults.forEach((s) => {
      out.push({
        id: `sym-${s.symbol}`,
        label: `${s.symbol} — ${s.name}`,
        hint: "Set as primary symbol",
        group: "Symbols",
        icon: <Search size={12} />,
        run: () => {
          setPreferred(s.symbol);
          // also broadcast to any panel in default group
          Object.values(ws.panels).forEach((p) => {
            if (p.config.symbol) {
              useWorkspace.getState().updatePanel(p.i, { config: { symbol: s.symbol } });
            }
          });
          setUI({ commandOpen: false });
        }
      });
    });

    // Add to watchlist
    symResults.slice(0, 3).forEach((s) => {
      out.push({
        id: `watch-${s.symbol}`,
        label: `Add ${s.symbol} to watchlist`,
        group: "Watchlist",
        icon: <Eye size={12} />,
        run: () => { addWatch(s.symbol); setUI({ commandOpen: false }); }
      });
    });

    // Widgets
    WIDGET_CATALOG.forEach((w) => {
      const matches = !q || w.name.toLowerCase().includes(q.toLowerCase()) || w.description.toLowerCase().includes(q.toLowerCase());
      if (matches) {
        out.push({
          id: `add-${w.type}`,
          label: `Add ${w.name}`,
          hint: w.description,
          group: "Widgets",
          icon: <w.icon size={12} className="text-falcon-amber" />,
          run: () => { addPanel(w.type); setUI({ commandOpen: false }); }
        });
      }
    });

    // Workspaces
    workspaces.forEach((w) => {
      if (!q || w.name.toLowerCase().includes(q.toLowerCase())) {
        out.push({
          id: `ws-${w.id}`,
          label: `Switch to "${w.name}"`,
          group: "Workspaces",
          icon: <Grid size={12} />,
          run: () => { setActive(w.id); setUI({ commandOpen: false }); }
        });
      }
    });
    out.push(
      { id: "new-ws-trader", label: "New workspace — Trader", group: "Workspaces", icon: <Plus size={12} />, run: () => { create("Trader", "trader"); setUI({ commandOpen: false }); } },
      { id: "new-ws-research", label: "New workspace — Research", group: "Workspaces", icon: <Plus size={12} />, run: () => { create("Research", "research"); setUI({ commandOpen: false }); } },
      { id: "new-ws-macro", label: "New workspace — Macro", group: "Workspaces", icon: <Plus size={12} />, run: () => { create("Macro", "macro"); setUI({ commandOpen: false }); } }
    );

    out.push(
      { id: "act-help", label: "Show help & shortcuts", group: "Actions", run: () => { setUI({ helpOpen: true, commandOpen: false }); } }
    );

    if (q.trim()) {
      // Direct symbol jump if exact match
      const direct = searchInstruments(q, 1);
      if (direct.length && direct[0].symbol.toUpperCase() === q.toUpperCase()) {
        out.unshift({
          id: "direct-sym",
          label: `Jump to ${direct[0].symbol}`,
          group: "Symbols",
          icon: <ArrowRight size={12} className="text-falcon-amber" />,
          run: () => {
            setPreferred(direct[0].symbol);
            setUI({ commandOpen: false });
          }
        });
      }
    }

    return out;
  }, [q, workspaces, ws, addPanel, addWatch, create, setActive, setPreferred, setUI]);

  if (!open) return null;

  // Group actions
  const grouped = actions.reduce<Record<string, Action[]>>((m, a) => {
    if (!m[a.group]) m[a.group] = [];
    m[a.group].push(a);
    return m;
  }, {});
  const flat = actions; // for keyboard navigation

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={() => setUI({ commandOpen: false })}
    >
      <div
        className="w-[640px] max-w-[92vw] bg-bg-1 border border-line rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-line-soft">
          <Search size={14} className="text-ink-mute" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setHover(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setHover((h) => Math.min(h + 1, flat.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setHover((h) => Math.max(h - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); flat[hover]?.run(); }
            }}
            placeholder="Search symbols, widgets, workspaces…"
            className="flex-1 bg-transparent outline-none text-[13.5px] text-ink placeholder-ink-faint font-mono"
          />
          <span className="text-[9.5px] uppercase tracking-wider text-ink-mute">⌘K</span>
        </div>
        <div className="max-h-[60vh] overflow-auto">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="px-3 pt-2 pb-1 text-[9.5px] uppercase tracking-wider text-ink-mute">{group}</div>
              {items.map((a) => {
                const flatIdx = flat.indexOf(a);
                return (
                  <button
                    key={a.id}
                    onMouseEnter={() => setHover(flatIdx)}
                    onClick={() => a.run()}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 flex items-center gap-2",
                      flatIdx === hover ? "bg-bg-3" : "hover:bg-bg-3"
                    )}
                  >
                    <span className="w-4 flex justify-center text-ink-mute">{a.icon ?? <Sparkles size={11} />}</span>
                    <span className="text-[12px] text-ink">{a.label}</span>
                    {a.hint && <span className="ml-auto text-[10.5px] text-ink-mute truncate">{a.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
          {actions.length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-ink-mute">No matches.</div>
          )}
        </div>
      </div>
    </div>
  );
}
