"use client";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { StickyNote } from "lucide-react";
import { useEffect, useState } from "react";

export function NotesWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const updatePanel = useWorkspace((s) => s.updatePanel);
  const panel = ws.panels[panelId];
  const [text, setText] = useState((panel?.config.notes as string) ?? "");
  // Debounced save back to panel config
  useEffect(() => {
    const t = setTimeout(() => updatePanel(panelId, { config: { notes: text } }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><StickyNote size={12} className="text-falcon-amber" /> Notes</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Trade journal, watchlist notes, levels…"
        className="w-full h-full bg-transparent p-3 text-[12.5px] font-mono leading-relaxed text-ink resize-none outline-none placeholder-ink-faint"
      />
    </Panel>
  );
}
