"use client";
import { searchInstruments } from "@/lib/instruments";
import { Instrument } from "@/lib/types";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value?: string;
  onChange: (symbol: string) => void;
  size?: "sm" | "md";
  placeholder?: string;
  className?: string;
}

export function SymbolPicker({ value, onChange, size = "sm", placeholder = "Search symbol...", className }: Props) {
  const [q, setQ] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results: Instrument[] = q ? searchInstruments(q, 10) : [];

  useEffect(() => setQ(value ?? ""), [value]);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function commit(sym: string) {
    onChange(sym.toUpperCase());
    setQ(sym.toUpperCase());
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={ref} className={"relative " + (className ?? "")}>
      <div className="relative">
        <Search size={size === "sm" ? 11 : 13} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          ref={inputRef}
          value={q}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setHover(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setHover((h) => Math.min(h + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHover((h) => Math.max(h - 1, 0)); }
            else if (e.key === "Enter" && results[hover]) { e.preventDefault(); commit(results[hover].symbol); }
            else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
          }}
          placeholder={placeholder}
          className={
            "w-full bg-bg-3/50 border border-line-soft hover:border-line focus:border-falcon-amber rounded font-mono uppercase " +
            (size === "sm" ? "text-[11px] pl-6 pr-2 h-6" : "text-[13px] pl-7 pr-2 h-8")
          }
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-72 max-h-72 overflow-auto bg-bg-2 border border-line rounded-md shadow-2xl">
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onMouseEnter={() => setHover(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(r.symbol)}
              className={
                "w-full text-left px-2 py-1.5 flex items-center gap-2 " +
                (i === hover ? "bg-bg-3" : "hover:bg-bg-3")
              }
            >
              <span className="font-mono text-[11px] text-falcon-amber w-14">{r.symbol}</span>
              <span className="text-[11px] text-ink truncate">{r.name}</span>
              <span className="ml-auto text-[10px] uppercase text-ink-mute">{r.asset}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
