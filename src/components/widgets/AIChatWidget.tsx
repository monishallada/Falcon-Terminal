"use client";
import { useEffect, useRef, useState } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { Sparkles, Send, RotateCcw } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { answerStream, newChat } from "@/lib/ai";
import { useLocalState } from "@/lib/hooks";

const SUGGESTIONS = [
  "Summarize NVDA's last earnings call",
  "Why is TSLA moving today?",
  "Compare GOOGL and MSFT revenue growth",
  "Find quality names with P/E under 25",
  "What's the macro picture this week?",
  "Build a short thesis on PLTR"
];

export function AIChatWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];

  const [messages, setMessages] = useLocalState<ChatMessage[]>(`falcon.ai.chat.${panelId}`, [
    newChat("system", "Falcon AI Research — synthesizes responses using live market data, filings, and your portfolio context.")
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function send(qOverride?: string) {
    const q = (qOverride ?? input).trim();
    if (!q || streaming) return;
    const userMsg = newChat("user", q);
    const assistantId = newChat("assistant", "").id;
    const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "", ts: Date.now(), streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);
    const gen = answerStream(q);
    let acc = "";
    function step() {
      const { value, done } = gen.next();
      if (done) {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc, streaming: false } : m)));
        setStreaming(false);
        return;
      }
      acc += value;
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
      setTimeout(step, 14 + Math.random() * 18);
    }
    setTimeout(step, 220);
  }

  function reset() {
    setMessages([newChat("system", "Falcon AI Research — fresh session.")]);
  }

  const visible = messages.filter((m) => m.role !== "system");

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Sparkles size={12} className="text-falcon-amber" /> AI Research</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
      rightAdornment={
        <button
          title="Reset chat"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); reset(); }}
          className="p-1 rounded hover:bg-bg-3 text-ink-mute hover:text-ink"
        >
          <RotateCcw size={11} />
        </button>
      }
    >
      <div className="h-full flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-3">
          {visible.length === 0 && (
            <div className="text-center text-ink-mute text-[12px] py-6">
              Ask anything about a ticker, the macro picture, or your portfolio.
            </div>
          )}
          {visible.map((m) => (
            <Message key={m.id} m={m} />
          ))}
          {visible.length === 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-mute mb-1.5">Try</div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => send(s)}
                    className="text-[10.5px] px-2 py-1 rounded border border-line-soft hover:border-falcon-amber hover:text-falcon-amber text-ink-dim"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-line-soft bg-bg-2/40">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask Falcon AI…"
              className="flex-1 resize-none bg-bg-3/40 border border-line-soft hover:border-line focus:border-falcon-amber rounded px-2 py-1.5 text-[12px] font-mono leading-snug max-h-32"
            />
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => send()}
              disabled={streaming || !input.trim()}
              className="h-8 px-3 rounded bg-falcon-amber/15 text-falcon-amber border border-falcon-amber/30 hover:bg-falcon-amber/25 disabled:opacity-40 disabled:hover:bg-falcon-amber/15 flex items-center gap-1.5 text-[11px] font-mono"
            >
              <Send size={11} /> Send
            </button>
          </div>
          <div className="text-[9.5px] text-ink-mute mt-1 font-mono uppercase tracking-wider">
            Powered by RAG over filings, transcripts, and live Falcon data.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Message({ m }: { m: ChatMessage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-falcon-amber/10 border border-falcon-amber/30 rounded-lg px-3 py-1.5 text-[12px] leading-snug">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex">
      <div className="max-w-[92%] bg-bg-2 border border-line-soft rounded-lg px-3 py-2 text-[12px] leading-relaxed">
        <Markdown text={m.content} />
        {m.streaming && (
          <span className="inline-block w-1.5 h-3 bg-falcon-amber animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

// Lightweight markdown renderer — handles headings, bold, list items, code-ish
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  function flushTable(idx: number) {
    if (tableRows.length === 0) return;
    const head = tableRows[0];
    const body = tableRows.slice(2); // skip alignment row
    out.push(
      <table key={`tbl-${idx}`} className="w-full text-[11px] font-mono border border-line-soft my-2">
        <thead className="bg-bg-3/40">
          <tr>{head.map((h, i) => <th key={i} className="text-left px-2 py-1 border-b border-line-soft">{h.trim()}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-line-soft/40">
              {row.map((c, ci) => <td key={ci} className="px-2 py-0.5">{c.trim()}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
    inTable = false;
    tableRows = [];
  }

  lines.forEach((line, idx) => {
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      const cells = line.trim().slice(1, -1).split("|");
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(idx);
    }
    if (line.startsWith("## ")) {
      out.push(<div key={idx} className="text-[13px] font-bold text-ink mt-1">{inline(line.slice(3))}</div>);
    } else if (line.startsWith("### ")) {
      out.push(<div key={idx} className="text-[12px] font-bold text-falcon-amber mt-1">{inline(line.slice(4))}</div>);
    } else if (/^\s*\d+\.\s/.test(line)) {
      out.push(<div key={idx} className="ml-3 text-[12px] leading-relaxed">{inline(line)}</div>);
    } else if (line.trim().startsWith("- ")) {
      out.push(<div key={idx} className="flex gap-2 ml-1 text-[12px]"><span className="text-falcon-amber">•</span><span>{inline(line.replace(/^\s*-\s/, ""))}</span></div>);
    } else if (line.trim() === "") {
      out.push(<div key={idx} className="h-1.5" />);
    } else {
      out.push(<div key={idx} className="text-[12px] leading-relaxed">{inline(line)}</div>);
    }
  });
  if (inTable) flushTable(lines.length);
  return <div className="space-y-0.5">{out}</div>;
}

function inline(text: string): React.ReactNode {
  // bold and italic
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        parts.push(<strong key={key++} className="text-ink font-semibold">{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "_") {
      const end = text.indexOf("_", i + 1);
      if (end !== -1) {
        parts.push(<em key={key++} className="text-ink-dim italic">{text.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    // collect plain text up to next marker
    let j = i;
    while (j < text.length && !text.startsWith("**", j) && text[j] !== "_") j++;
    parts.push(text.slice(i, j));
    i = j;
  }
  return parts;
}
