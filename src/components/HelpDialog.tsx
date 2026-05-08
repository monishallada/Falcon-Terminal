"use client";
import { useWorkspace } from "@/store/workspace";
import { X } from "lucide-react";

export function HelpDialog() {
  const open = useWorkspace((s) => s.ui.helpOpen);
  const setUI = useWorkspace((s) => s.setUI);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setUI({ helpOpen: false })}>
      <div className="w-[640px] max-w-[92vw] max-h-[85vh] overflow-auto bg-bg-1 border border-line rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-line-soft flex items-center">
          <h2 className="text-[14px] font-bold text-ink">Falcon Terminal — Quick Start</h2>
          <button onClick={() => setUI({ helpOpen: false })} className="ml-auto p-1 rounded hover:bg-bg-3 text-ink-mute hover:text-ink"><X size={14} /></button>
        </div>
        <div className="p-4 space-y-4 text-[12.5px] leading-relaxed">
          <Section title="The workspace is everything">
            Falcon is built around the idea that an investing terminal should feel like an OS. Every panel is a widget — chart, watchlist, AI chat, news, options flow — and you arrange them into a workspace that persists across sessions. Drag the header bar to move; drag the bottom-right corner to resize.
          </Section>
          <Section title="Panel link groups">
            Click the link icon at the top right of any panel and pick a color to assign that panel to a group. When you change the active symbol in any panel in that group, every other panel in the same group follows. This mirrors Bloomberg's panel linking and is the fastest way to do single-symbol research across multiple widgets.
          </Section>
          <Section title="Keyboard shortcuts">
            <table className="font-mono text-[11.5px]">
              <tbody>
                <Row k="⌘K / Ctrl+K" v="Open command palette" />
                <Row k="Esc" v="Close any dialog" />
                <Row k="Click symbol in list" v="Updates linked panels" />
                <Row k="Double-click tab" v="Rename workspace" />
              </tbody>
            </table>
          </Section>
          <Section title="Simulation">
            The data feed is a deterministic Monte Carlo simulator that produces realistic ticks, OHLCV bars, news, social posts, and options flow — all live, all mutually consistent. Use the speed pill in the top bar to slow down, pause, or accelerate time. The interfaces are identical to a real provider (Polygon, EDGAR, FRED) so swapping in real data later is a configuration change, not a refactor.
          </Section>
          <Section title="What's gated by tier in production">
            In a deployed build, real-time data, options flow, and the screener are Pro-tier. Level II and AI-unlimited are Elite. The frontend already speaks tier-aware: the API layer would gate the streams server-side via JWT claims as specified in the engineering doc.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-falcon-amber font-semibold mb-1">{title}</div>
      <div className="text-ink-dim">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td className="pr-4 py-0.5 text-falcon-amber">{k}</td>
      <td className="text-ink-dim">{v}</td>
    </tr>
  );
}
