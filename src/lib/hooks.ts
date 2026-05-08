"use client";
import { useEffect, useRef, useState } from "react";
import { getMarket } from "./market";
import { Quote } from "./types";

export function useQuote(symbol?: string): Quote | undefined {
  const [q, setQ] = useState<Quote | undefined>(undefined);
  useEffect(() => {
    if (!symbol) return;
    const m = getMarket();
    setQ(m.getQuote(symbol));
    const off = m.subscribe(symbol, setQ);
    return off;
  }, [symbol]);
  return q;
}

export function useQuotes(symbols: string[]): Record<string, Quote> {
  const [map, setMap] = useState<Record<string, Quote>>({});
  // keep a ref so we don't tear if symbols list changes mid-stream
  const ref = useRef<Record<string, Quote>>({});
  useEffect(() => {
    if (symbols.length === 0) {
      setMap({});
      ref.current = {};
      return;
    }
    const m = getMarket();
    // seed
    const seed: Record<string, Quote> = {};
    symbols.forEach((s) => {
      const q = m.getQuote(s);
      if (q) seed[s] = q;
    });
    ref.current = seed;
    setMap(seed);
    const offs = symbols.map((s) =>
      m.subscribe(s, (q) => {
        ref.current = { ...ref.current, [s]: q };
        // Throttle slightly via rAF batching
        scheduleFlush(setMap, ref);
      })
    );
    return () => offs.forEach((o) => o());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);
  return map;
}

let pending = false;
function scheduleFlush(setMap: (m: Record<string, Quote>) => void, ref: React.MutableRefObject<Record<string, Quote>>) {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    setMap({ ...ref.current });
  });
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
}
