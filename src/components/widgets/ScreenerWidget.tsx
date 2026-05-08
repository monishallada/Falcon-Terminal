"use client";
import { useMemo, useState } from "react";
import { Panel } from "../ui/Panel";
import { useWorkspace } from "@/store/workspace";
import { INSTRUMENTS, SECTORS } from "@/lib/instruments";
import { useQuotes } from "@/lib/hooks";
import { fmtMcap, fmtPct, fmtPrice, fmtVol } from "@/lib/market";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { PriceCell } from "../ui/PriceCell";

interface Filters {
  q: string;
  sector: string;
  minMcap?: number;
  maxPe?: number;
  minRevG?: number;
  minDiv?: number;
  asset: "all" | "equity" | "etf" | "crypto";
  preset: string;
}

const PRESETS = [
  { id: "all", name: "All", apply: (_: Filters): Partial<Filters> => ({ minMcap: undefined, maxPe: undefined, minRevG: undefined }) },
  { id: "momentum", name: "High Volume Momentum", apply: () => ({ minMcap: 5e9, maxPe: undefined, minRevG: 0.1 }) },
  { id: "value", name: "Oversold Value", apply: () => ({ maxPe: 20, minMcap: 10e9, minRevG: undefined }) },
  { id: "growth", name: "Growth Names", apply: () => ({ minRevG: 0.20, minMcap: 5e9 }) },
  { id: "div", name: "Dividend Income", apply: () => ({ minDiv: 0.02, minMcap: 50e9 }) },
  { id: "ai", name: "AI Beneficiaries", apply: () => ({ minMcap: 100e9, minRevG: 0.10 }) }
];

type SortKey = "symbol" | "price" | "changePct" | "marketCap" | "pe" | "revenueGrowth" | "divYield" | "beta" | "volume";
type SortDir = "asc" | "desc";

export function ScreenerWidget({ panelId }: { panelId: string }) {
  const ws = useWorkspace((s) => s.active());
  const setPanelSymbol = useWorkspace((s) => s.setPanelSymbol);
  const setGroup = useWorkspace((s) => s.setPanelGroup);
  const removePanel = useWorkspace((s) => s.removePanel);
  const panel = ws.panels[panelId];

  const [f, setF] = useState<Filters>({
    q: "",
    sector: "All",
    asset: "all",
    preset: "all"
  });
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "marketCap", dir: "desc" });

  const symbols = useMemo(() => INSTRUMENTS.filter((i) => i.asset === "equity" || i.asset === "etf").map((i) => i.symbol), []);
  const quotes = useQuotes(symbols);

  const rows = useMemo(() => {
    let list = INSTRUMENTS.filter((i) => i.asset === "equity" || i.asset === "etf");
    if (f.asset !== "all") list = list.filter((i) => i.asset === f.asset);
    if (f.q) {
      const s = f.q.toUpperCase();
      list = list.filter((i) => i.symbol.includes(s) || i.name.toUpperCase().includes(s));
    }
    if (f.sector !== "All") list = list.filter((i) => i.sector === f.sector);
    if (f.minMcap !== undefined) list = list.filter((i) => (i.marketCap ?? 0) >= f.minMcap!);
    if (f.maxPe !== undefined) list = list.filter((i) => (i.pe ?? 999) <= f.maxPe!);
    if (f.minRevG !== undefined) list = list.filter((i) => (i.revenueGrowth ?? 0) >= f.minRevG!);
    if (f.minDiv !== undefined) list = list.filter((i) => (i.divYield ?? 0) >= f.minDiv!);

    const enriched = list.map((i) => {
      const q = quotes[i.symbol];
      return {
        inst: i,
        q,
        price: q?.price ?? i.basePrice,
        changePct: q?.changePct ?? 0,
        volume: q?.volume ?? i.avgVolume ?? 0
      };
    });

    enriched.sort((a, b) => {
      const get = (r: typeof a) => {
        switch (sort.key) {
          case "symbol": return r.inst.symbol;
          case "price": return r.price;
          case "changePct": return r.changePct;
          case "marketCap": return r.inst.marketCap ?? 0;
          case "pe": return r.inst.pe ?? Number.MAX_VALUE;
          case "revenueGrowth": return r.inst.revenueGrowth ?? 0;
          case "divYield": return r.inst.divYield ?? 0;
          case "beta": return r.inst.beta ?? 0;
          case "volume": return r.volume;
        }
      };
      const av = get(a) as number | string;
      const bv = get(b) as number | string;
      let c = 0;
      if (typeof av === "number" && typeof bv === "number") c = av - bv;
      else c = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? c : -c;
    });

    return enriched;
  }, [f, sort, quotes]);

  function flipSort(k: SortKey) {
    setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "desc" }));
  }

  function applyPreset(id: string) {
    const p = PRESETS.find((p) => p.id === id);
    if (!p) return;
    setF((cur) => ({ ...cur, ...p.apply(cur), preset: id }));
  }

  return (
    <Panel
      title={<span className="flex items-center gap-1.5"><Filter size={12} className="text-falcon-amber" /> Screener</span>}
      group={panel?.group}
      onSetGroup={(c) => setGroup(panelId, c)}
      onClose={() => removePanel(panelId)}
    >
      <div className="h-full flex flex-col">
        <div className="px-2 py-1.5 border-b border-line-soft flex items-center gap-1.5 flex-wrap">
          <input
            placeholder="Search symbol or name…"
            value={f.q}
            onChange={(e) => setF({ ...f, q: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            className="h-6 w-44 bg-bg-3/40 border border-line-soft hover:border-line focus:border-falcon-amber rounded px-2 text-[11px] font-mono"
          />
          <select
            value={f.sector}
            onChange={(e) => setF({ ...f, sector: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            className="h-6 bg-bg-3/40 border border-line-soft hover:border-line rounded px-1.5 text-[11px] font-mono"
          >
            <option>All</option>
            {SECTORS.map((s) => (<option key={s}>{s}</option>))}
          </select>
          <select
            value={f.asset}
            onChange={(e) => setF({ ...f, asset: e.target.value as Filters["asset"] })}
            onMouseDown={(e) => e.stopPropagation()}
            className="h-6 bg-bg-3/40 border border-line-soft hover:border-line rounded px-1.5 text-[11px] font-mono uppercase"
          >
            <option value="all">All assets</option>
            <option value="equity">Equity</option>
            <option value="etf">ETF</option>
          </select>
          <div className="flex items-center gap-1 ml-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => applyPreset(p.id)}
                className={clsx(
                  "px-2 h-6 text-[10.5px] font-mono rounded border",
                  f.preset === p.id ? "border-falcon-amber/50 bg-falcon-amber/10 text-falcon-amber" : "border-line-soft text-ink-mute hover:text-ink hover:bg-bg-3"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[10.5px] text-ink-mute font-mono">
            {rows.length} matches
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px] font-mono">
            <thead className="sticky top-0 bg-bg-2 text-ink-mute uppercase text-[9.5px]">
              <tr className="border-b border-line-soft">
                <Th k="symbol" sort={sort} onClick={flipSort} className="text-left">Symbol</Th>
                <Th k="price" sort={sort} onClick={flipSort}>Last</Th>
                <Th k="changePct" sort={sort} onClick={flipSort}>Chg%</Th>
                <Th k="volume" sort={sort} onClick={flipSort}>Vol</Th>
                <Th k="marketCap" sort={sort} onClick={flipSort}>Mcap</Th>
                <Th k="pe" sort={sort} onClick={flipSort}>P/E</Th>
                <Th k="revenueGrowth" sort={sort} onClick={flipSort}>Rev g</Th>
                <Th k="divYield" sort={sort} onClick={flipSort}>Div%</Th>
                <Th k="beta" sort={sort} onClick={flipSort}>Beta</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.inst.symbol}
                  className="border-b border-line-soft/40 hover:bg-bg-3 cursor-pointer"
                  onClick={() => setPanelSymbol(panelId, r.inst.symbol)}
                >
                  <td className="px-2 py-1">
                    <div className="text-ink font-semibold">{r.inst.symbol}</div>
                    <div className="text-[9.5px] text-ink-mute truncate max-w-[160px]">{r.inst.name}</div>
                  </td>
                  <td className="text-right px-2">
                    <PriceCell value={r.price} format={(v) => fmtPrice(v, r.inst.asset)} />
                  </td>
                  <td className={clsx("text-right px-2", r.changePct >= 0 ? "text-bull" : "text-bear")}>
                    {fmtPct(r.changePct)}
                  </td>
                  <td className="text-right px-2 text-ink-dim">{fmtVol(r.volume)}</td>
                  <td className="text-right px-2 text-ink">{fmtMcap(r.inst.marketCap)}</td>
                  <td className="text-right px-2 text-ink-dim">{r.inst.pe ? r.inst.pe.toFixed(1) : "—"}</td>
                  <td className="text-right px-2 text-ink-dim">{r.inst.revenueGrowth !== undefined ? (r.inst.revenueGrowth * 100).toFixed(1) + "%" : "—"}</td>
                  <td className="text-right px-2 text-ink-dim">{r.inst.divYield ? (r.inst.divYield * 100).toFixed(2) + "%" : "—"}</td>
                  <td className="text-right px-2 text-ink-dim">{r.inst.beta?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

function Th({ k, sort, onClick, children, className }: { k: SortKey; sort: { key: SortKey; dir: SortDir }; onClick: (k: SortKey) => void; children: React.ReactNode; className?: string }) {
  const active = sort.key === k;
  return (
    <th className={clsx("px-2 py-1 font-medium select-none", className ?? "text-right")}>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => onClick(k)}
        className={clsx("inline-flex items-center gap-0.5 cursor-pointer hover:text-ink", active && "text-falcon-amber")}
      >
        {children}
        {active && (sort.dir === "asc" ? <ChevronUp size={9} /> : <ChevronDown size={9} />)}
      </button>
    </th>
  );
}
