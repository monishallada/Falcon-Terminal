"use client";
import { create } from "zustand";
import { nanoid } from "nanoid";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AlertRule,
  ChipColor,
  PanelConfig,
  PanelState,
  Position,
  WidgetType,
  Workspace
} from "@/lib/types";

interface UIState {
  commandOpen: boolean;
  helpOpen: boolean;
  settingsOpen: boolean;
  speed: number;
}

interface WorkspaceStore {
  workspaces: Workspace[];
  activeId: string;
  watchlist: string[]; // symbol list
  positions: Position[];
  alerts: AlertRule[];
  // user prefs
  preferredSymbol: string;
  ui: UIState;

  // actions
  active(): Workspace;
  setActive(id: string): void;
  createWorkspace(name: string, template?: "blank" | "trader" | "research" | "macro"): string;
  renameWorkspace(id: string, name: string): void;
  deleteWorkspace(id: string): void;
  duplicateWorkspace(id: string): void;

  setLayout(layout: Workspace["layout"]): void;
  addPanel(type: WidgetType, config?: PanelConfig): void;
  removePanel(id: string): void;
  updatePanel(id: string, patch: Partial<PanelState>): void;
  setPanelGroup(id: string, color: ChipColor | null): void;
  setPanelSymbol(id: string, symbol: string): void;
  // group-link broadcast
  broadcastSymbol(originPanel: string, symbol: string): void;

  addToWatchlist(symbol: string): void;
  removeFromWatchlist(symbol: string): void;

  addPosition(p: Position): void;
  removePosition(symbol: string): void;
  updatePosition(symbol: string, patch: Partial<Position>): void;

  addAlert(rule: Omit<AlertRule, "id" | "ts" | "fired">): void;
  removeAlert(id: string): void;

  setUI(patch: Partial<UIState>): void;
  setPreferredSymbol(s: string): void;
}

// Layout templates
function tplBlank(): { layout: Workspace["layout"]; panels: Record<string, PanelState> } {
  const id = nanoid(6);
  return {
    layout: [{ i: id, x: 0, y: 0, w: 12, h: 12 }],
    panels: { [id]: { i: id, type: "chart", group: "blue", config: { symbol: "AAPL", timeframe: "5m", indicators: ["EMA20", "EMA50", "VWAP"] } } }
  };
}

function tplTrader(): { layout: Workspace["layout"]; panels: Record<string, PanelState> } {
  const ids = Array.from({ length: 6 }, () => nanoid(6));
  const [chart, watch, news, tape, opt, ai] = ids;
  return {
    layout: [
      { i: chart, x: 0, y: 0, w: 16, h: 14, minW: 6, minH: 6 },
      { i: watch, x: 16, y: 0, w: 8, h: 14, minW: 4, minH: 6 },
      { i: news,  x: 0, y: 14, w: 10, h: 10, minW: 5, minH: 6 },
      { i: tape,  x: 10, y: 14, w: 8, h: 10, minW: 4, minH: 6 },
      { i: opt,   x: 18, y: 14, w: 6, h: 10, minW: 4, minH: 6 },
      { i: ai,    x: 0, y: 24, w: 24, h: 8, minW: 6, minH: 6 }
    ],
    panels: {
      [chart]: { i: chart, type: "chart", group: "blue", config: { symbol: "NVDA", timeframe: "5m", indicators: ["EMA20", "EMA50", "VWAP"] } },
      [watch]: { i: watch, type: "watchlist", group: "blue", config: {} },
      [news]:  { i: news,  type: "news",      group: "blue", config: {} },
      [tape]:  { i: tape,  type: "time_sales",group: "blue", config: { symbol: "NVDA" } },
      [opt]:   { i: opt,   type: "options_flow", group: null, config: {} },
      [ai]:    { i: ai,    type: "ai_chat",   group: null, config: {} }
    }
  };
}

function tplResearch(): { layout: Workspace["layout"]; panels: Record<string, PanelState> } {
  const ids = Array.from({ length: 6 }, () => nanoid(6));
  const [chart, quote, port, screen, sent, news] = ids;
  return {
    layout: [
      { i: chart,  x: 0,  y: 0,  w: 14, h: 14 },
      { i: quote,  x: 14, y: 0,  w: 10, h: 6 },
      { i: sent,   x: 14, y: 6,  w: 10, h: 8 },
      { i: port,   x: 0,  y: 14, w: 12, h: 10 },
      { i: screen, x: 12, y: 14, w: 12, h: 10 },
      { i: news,   x: 0,  y: 24, w: 24, h: 8 }
    ],
    panels: {
      [chart]:  { i: chart,  type: "chart",     group: "yellow", config: { symbol: "AAPL", timeframe: "1D", indicators: ["EMA50", "EMA200", "Bollinger"] } },
      [quote]:  { i: quote,  type: "quote",     group: "yellow", config: { symbol: "AAPL" } },
      [sent]:   { i: sent,   type: "sentiment", group: "yellow", config: { symbol: "AAPL" } },
      [port]:   { i: port,   type: "portfolio", group: null,     config: {} },
      [screen]: { i: screen, type: "screener",  group: null,     config: {} },
      [news]:   { i: news,   type: "news",      group: "yellow", config: {} }
    }
  };
}

function tplMacro(): { layout: Workspace["layout"]; panels: Record<string, PanelState> } {
  const ids = Array.from({ length: 5 }, () => nanoid(6));
  const [heat, macro, news, cal, chart] = ids;
  return {
    layout: [
      { i: macro, x: 0,  y: 0,  w: 14, h: 14 },
      { i: heat,  x: 14, y: 0,  w: 10, h: 14 },
      { i: chart, x: 0,  y: 14, w: 14, h: 10 },
      { i: cal,   x: 14, y: 14, w: 10, h: 10 },
      { i: news,  x: 0,  y: 24, w: 24, h: 8 }
    ],
    panels: {
      [macro]: { i: macro, type: "macro",    group: null, config: {} },
      [heat]:  { i: heat,  type: "heatmap",  group: null, config: {} },
      [chart]: { i: chart, type: "chart",    group: "red", config: { symbol: "SPX", timeframe: "1D", indicators: ["EMA50", "EMA200"] } },
      [cal]:   { i: cal,   type: "calendar", group: null, config: {} },
      [news]:  { i: news,  type: "news",     group: null, config: {} }
    }
  };
}

function blankWorkspace(name: string, kind: "blank" | "trader" | "research" | "macro" = "trader"): Workspace {
  const seed =
    kind === "blank"   ? tplBlank()
    : kind === "research" ? tplResearch()
    : kind === "macro"    ? tplMacro()
    : tplTrader();
  return { id: nanoid(8), name, layout: seed.layout, panels: seed.panels, version: 1 };
}

const initialWorkspaces: Workspace[] = [
  { ...blankWorkspace("Trader", "trader"), name: "Trader" },
  { ...blankWorkspace("Research", "research"), name: "Research" },
  { ...blankWorkspace("Macro", "macro"), name: "Macro" }
];

export const useWorkspace = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      workspaces: initialWorkspaces,
      activeId: initialWorkspaces[0].id,
      watchlist: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD", "AVGO", "PLTR", "SPY", "QQQ", "BTC", "ETH", "SOL"],
      positions: [
        { symbol: "AAPL", shares: 50,  avgCost: 178.40, purchaseDate: "2024-03-12" },
        { symbol: "MSFT", shares: 30,  avgCost: 360.10, purchaseDate: "2024-04-22" },
        { symbol: "NVDA", shares: 100, avgCost: 92.50,  purchaseDate: "2024-05-04" },
        { symbol: "META", shares: 25,  avgCost: 480.00, purchaseDate: "2024-08-15" },
        { symbol: "AMZN", shares: 40,  avgCost: 165.30, purchaseDate: "2024-06-10" },
        { symbol: "SPY",  shares: 60,  avgCost: 540.00, purchaseDate: "2024-07-21" }
      ],
      alerts: [],
      preferredSymbol: "NVDA",
      ui: { commandOpen: false, helpOpen: false, settingsOpen: false, speed: 1 },

      active() {
        const id = get().activeId;
        return get().workspaces.find((w) => w.id === id) ?? get().workspaces[0];
      },
      setActive(id) {
        set({ activeId: id });
      },
      createWorkspace(name, template = "blank") {
        const w = blankWorkspace(name, template);
        set({ workspaces: [...get().workspaces, w], activeId: w.id });
        return w.id;
      },
      renameWorkspace(id, name) {
        set({ workspaces: get().workspaces.map((w) => (w.id === id ? { ...w, name } : w)) });
      },
      deleteWorkspace(id) {
        const ws = get().workspaces.filter((w) => w.id !== id);
        if (ws.length === 0) {
          ws.push(blankWorkspace("Untitled", "trader"));
        }
        set({ workspaces: ws, activeId: ws[0].id });
      },
      duplicateWorkspace(id) {
        const w = get().workspaces.find((x) => x.id === id);
        if (!w) return;
        const copy: Workspace = {
          ...w,
          id: nanoid(8),
          name: w.name + " copy",
          layout: w.layout.map((l) => ({ ...l, i: nanoid(6) })),
          panels: {}
        };
        // remap panels
        const idMap: Record<string, string> = {};
        w.layout.forEach((l, i) => (idMap[l.i] = copy.layout[i].i));
        Object.values(w.panels).forEach((p) => {
          const newId = idMap[p.i];
          copy.panels[newId] = { ...p, i: newId };
        });
        set({ workspaces: [...get().workspaces, copy], activeId: copy.id });
      },

      setLayout(layout) {
        const id = get().activeId;
        set({ workspaces: get().workspaces.map((w) => (w.id === id ? { ...w, layout } : w)) });
      },
      addPanel(type, config = {}) {
        const ws = get().active();
        const id = nanoid(6);
        // Find a spot — pile to the bottom of the lowest column
        const maxY = ws.layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
        const newLayout = [...ws.layout, { i: id, x: 0, y: maxY, w: 10, h: 10, minW: 4, minH: 5 }];
        const newPanels = {
          ...ws.panels,
          [id]: { i: id, type, group: null, config: { symbol: get().preferredSymbol, ...config } }
        };
        set({
          workspaces: get().workspaces.map((w) =>
            w.id === ws.id ? { ...w, layout: newLayout, panels: newPanels } : w
          )
        });
      },
      removePanel(id) {
        const ws = get().active();
        const layout = ws.layout.filter((l) => l.i !== id);
        const { [id]: _, ...panels } = ws.panels;
        void _;
        set({
          workspaces: get().workspaces.map((w) => (w.id === ws.id ? { ...w, layout, panels } : w))
        });
      },
      updatePanel(id, patch) {
        const ws = get().active();
        const cur = ws.panels[id];
        if (!cur) return;
        const merged: PanelState = {
          ...cur,
          ...patch,
          config: { ...cur.config, ...(patch.config ?? {}) }
        };
        set({
          workspaces: get().workspaces.map((w) =>
            w.id === ws.id ? { ...w, panels: { ...w.panels, [id]: merged } } : w
          )
        });
      },
      setPanelGroup(id, color) {
        get().updatePanel(id, { group: color });
      },
      setPanelSymbol(id, symbol) {
        get().updatePanel(id, { config: { symbol } });
        // broadcast to linked group
        get().broadcastSymbol(id, symbol);
      },
      broadcastSymbol(originPanel, symbol) {
        const ws = get().active();
        const origin = ws.panels[originPanel];
        if (!origin || !origin.group) return;
        const newPanels = { ...ws.panels };
        Object.values(ws.panels).forEach((p) => {
          if (p.i !== originPanel && p.group === origin.group) {
            newPanels[p.i] = { ...p, config: { ...p.config, symbol } };
          }
        });
        set({
          workspaces: get().workspaces.map((w) => (w.id === ws.id ? { ...w, panels: newPanels } : w)),
          preferredSymbol: symbol
        });
      },

      addToWatchlist(symbol) {
        const s = symbol.toUpperCase();
        if (get().watchlist.includes(s)) return;
        set({ watchlist: [...get().watchlist, s] });
      },
      removeFromWatchlist(symbol) {
        set({ watchlist: get().watchlist.filter((s) => s !== symbol) });
      },

      addPosition(p) {
        const exist = get().positions.find((x) => x.symbol === p.symbol);
        if (exist) {
          // weighted average
          const totalShares = exist.shares + p.shares;
          const avgCost = (exist.avgCost * exist.shares + p.avgCost * p.shares) / totalShares;
          set({
            positions: get().positions.map((x) =>
              x.symbol === p.symbol ? { ...x, shares: totalShares, avgCost } : x
            )
          });
        } else {
          set({ positions: [...get().positions, p] });
        }
      },
      removePosition(symbol) {
        set({ positions: get().positions.filter((p) => p.symbol !== symbol) });
      },
      updatePosition(symbol, patch) {
        set({
          positions: get().positions.map((p) => (p.symbol === symbol ? { ...p, ...patch } : p))
        });
      },

      addAlert(rule) {
        set({
          alerts: [
            ...get().alerts,
            { id: nanoid(6), ts: Date.now(), fired: false, ...rule }
          ]
        });
      },
      removeAlert(id) {
        set({ alerts: get().alerts.filter((a) => a.id !== id) });
      },

      setUI(patch) {
        set({ ui: { ...get().ui, ...patch } });
      },
      setPreferredSymbol(s) {
        set({ preferredSymbol: s.toUpperCase() });
      }
    }),
    {
      name: "falcon-terminal-v1",
      storage: createJSONStorage(() => (typeof window === "undefined" ? (undefined as unknown as Storage) : localStorage)),
      partialize: (s) => ({
        workspaces: s.workspaces,
        activeId: s.activeId,
        watchlist: s.watchlist,
        positions: s.positions,
        alerts: s.alerts,
        preferredSymbol: s.preferredSymbol
      })
    }
  )
);
