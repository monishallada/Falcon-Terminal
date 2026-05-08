"use client";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { earningsCalendar, MACRO_CALENDAR } from "@/lib/news";
import { CalendarDays } from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

export function CalendarWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];
  const [tab, setTab] = useState<"earnings" | "macro">("earnings");

  const earnings = useMemo(() => earningsCalendar(), []);

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-falcon-amber" /> Calendar</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col">
        <div className="px-2 py-1.5 border-b border-line-soft flex gap-1">
          {(["earnings", "macro"] as const).map((t) => (
            <button
              key={t}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setTab(t)}
              className={clsx(
                "px-2 h-6 rounded text-[10.5px] font-mono uppercase",
                tab === t ? "bg-falcon-amber/15 text-falcon-amber" : "text-ink-mute hover:bg-bg-3 hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto">
          {tab === "earnings" ? (
            <table className="w-full text-[11px] font-mono">
              <thead className="sticky top-0 bg-bg-2 text-ink-mute uppercase text-[9.5px]">
                <tr className="border-b border-line-soft">
                  <th className="text-left px-2 py-1 font-medium">Date</th>
                  <th className="text-left px-2 py-1 font-medium">Sym</th>
                  <th className="text-left px-2 py-1 font-medium">Name</th>
                  <th className="text-center px-2 py-1 font-medium">Time</th>
                  <th className="text-right px-2 py-1 font-medium">EPS est</th>
                  <th className="text-right px-2 py-1 font-medium">Rev est</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e) => (
                  <tr
                    key={e.symbol + e.date}
                    onClick={() => setPanelSymbol(panelId, e.symbol)}
                    className="border-b border-line-soft/40 hover:bg-bg-3 cursor-pointer"
                  >
                    <td className="px-2 py-1 text-ink-dim">{e.date}</td>
                    <td className="px-2 py-1 text-ink font-semibold">{e.symbol}</td>
                    <td className="px-2 py-1 text-ink-dim truncate max-w-[180px]">{e.name}</td>
                    <td className="px-2 py-1 text-center text-falcon-amber">{e.time}</td>
                    <td className="px-2 py-1 text-right">${e.epsEstimate}</td>
                    <td className="px-2 py-1 text-right">${(e.revEstimate / 1e9).toFixed(2)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-[11px] font-mono">
              <thead className="sticky top-0 bg-bg-2 text-ink-mute uppercase text-[9.5px]">
                <tr className="border-b border-line-soft">
                  <th className="text-left px-2 py-1 font-medium">Date</th>
                  <th className="text-left px-2 py-1 font-medium">Time</th>
                  <th className="text-left px-2 py-1 font-medium">Event</th>
                  <th className="text-right px-2 py-1 font-medium">Prior</th>
                  <th className="text-right px-2 py-1 font-medium">Consensus</th>
                  <th className="text-center px-2 py-1 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                {MACRO_CALENDAR.map((e, i) => (
                  <tr key={i} className="border-b border-line-soft/40 hover:bg-bg-3">
                    <td className="px-2 py-1 text-ink-dim">{e.date}</td>
                    <td className="px-2 py-1 text-ink-dim">{e.time}</td>
                    <td className="px-2 py-1 text-ink">{e.event}</td>
                    <td className="px-2 py-1 text-right">{e.prior}</td>
                    <td className="px-2 py-1 text-right">{e.consensus}</td>
                    <td className="px-2 py-1 text-center">
                      <span className={clsx(
                        "px-1.5 py-px rounded text-[9.5px] uppercase font-bold",
                        e.impact === "high" ? "bg-bear/15 text-bear" : "bg-falcon-amber/15 text-falcon-amber"
                      )}>{e.impact}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Panel>
  );
}
