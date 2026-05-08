"use client";
import { useEffect, useState } from "react";
import { getNewsStream } from "@/lib/news";
import { NewsItem } from "@/lib/types";
import { Zap, X } from "lucide-react";

export function BreakingNewsBanner() {
  const [item, setItem] = useState<NewsItem | null>(null);
  useEffect(() => {
    const off = getNewsStream().subscribe((n) => {
      if (n.urgency === "breaking") {
        setItem(n);
        setTimeout(() => setItem((cur) => (cur?.id === n.id ? null : cur)), 12_000);
      }
    });
    return off;
  }, []);
  if (!item) return null;
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-[min(680px,90vw)]">
      <div className="bg-bear/15 border border-bear/50 backdrop-blur rounded-md shadow-2xl px-3 py-2 flex items-center gap-2">
        <span className="bg-bear text-white text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1">
          <Zap size={10} /> Breaking
        </span>
        <span className="text-[12.5px] text-ink truncate flex-1">{item.headline}</span>
        <span className="text-[10px] text-ink-mute font-mono uppercase">{item.source}</span>
        <button onClick={() => setItem(null)} className="p-1 rounded hover:bg-bg-3 text-ink-mute hover:text-ink">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}
