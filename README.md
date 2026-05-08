# Falcon Terminal

A Bloomberg-inspired retail investment terminal. Modular workspace, real-time data, AI-native research — built per the Falcon Developer Spec.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## What's built

### Workspace engine (the "OS")
- Drag-and-resize panels (react-grid-layout, 24-col grid).
- Multiple named workspaces, persisted to localStorage. Three boot templates: **Trader**, **Research**, **Macro**.
- **Panel link groups** — colored chips on the panel header tie panels together. Change the symbol in any linked panel and the group follows. Bloomberg-style.
- Workspace serialization is versioned (`Workspace.version`) so future widget types and config keys are forward-compatible.

### 16 widgets
| Widget | What it does |
|---|---|
| Chart | TradingView Lightweight Charts. Candle/line/area, 8 timeframes, EMA/SMA/VWAP/Bollinger overlays, OHLC readout. Live-tick updates roll the current bar. |
| Watchlist | Sortable table of subscribed symbols with sparklines and live ticks. |
| Quote | Single-symbol detail card: bid/ask, OHLC, 52w range, fundamentals. |
| Time & Sales | Per-symbol print-by-print tape, color-coded by aggressor side. |
| Level II | 12-deep order book grouped by market maker, with size bars. |
| Tape | Scrolling cross-asset ticker. |
| News | Streaming wires with sentiment, urgency, and per-symbol filter. |
| Sentiment | Bull/bear dial, mention velocity, trending-ticker sidebar, social feed. |
| AI Research | Streaming chat with intent routing — earnings, intraday explain, comparison, screen, macro, thesis, fundamentals. Cleanly swappable to a real Claude/GPT call. |
| Portfolio | Live P&L, sector allocation, weighted beta, AI portfolio summary. |
| Screener | AG-Grid-style table with presets (Momentum, Value, Growth, Dividend, AI). |
| Options Flow | Live unusual-options stream, PCR aggregate, sweep tags, premium filters. |
| Macro | Indices, sector ETFs, FX, commodities, crypto, treasuries; yield curve readout. |
| Heatmap | Sector-grouped market heat, sized by market cap. |
| Calendar | Earnings + macro release calendars. |
| Notes | Per-panel free-form trade journal. |

### Data engine
- `src/lib/market.ts` — deterministic GBM simulator that produces realistic streaming quotes, OHLCV history, bid/ask spreads, and volume across 60+ instruments (US equities, ETFs, crypto, FX, commodities, indices, treasuries). Adjustable speed; pause supported.
- `src/lib/news.ts` — synthesizes news, options trades, and social posts from realistic templates with sentiment scoring and entity extraction.
- `src/lib/indicators.ts` — SMA / EMA / RSI / MACD / Bollinger / VWAP / ATR.
- `src/lib/ai.ts` — provider-agnostic answer generator (the spec calls this out as a key abstraction).

### Shell
- ⌘K command palette: jump to symbols, add widgets, switch workspaces.
- Top bar: workspace tabs, index strip, simulation speed (0×–10×), live status pill, clock.
- Breaking news banner. Help dialog. Status bar.
- Dark amber-on-black aesthetic, monospace numerics.

## Architecture notes

The frontend is the deliverable in this build. The data layer is structured to make the spec's backend swap a configuration change rather than a rewrite:

- `getMarket()` is a singleton that owns subscriptions; replace its tick loop with a Socket.io client subscribing to `quotes:{symbol}` Redis channels and the rest of the app stays put.
- `getNewsStream()` follows the same pattern — swap to an SSE/WebSocket source.
- `answerStream()` returns a generator; replace the synthesizer with `fetch("/api/ai/stream", ...)` reading SSE chunks.
- `INSTRUMENTS` is a static catalog; replace with a `/symbols` REST call cached in localStorage.

## Out of scope (per single-session budget)

Auth (Auth0/Clerk), Stripe billing, subscription tier gating UI, real Polygon/EDGAR/FRED integration, Electron shell, mobile apps, brokerage OAuth, full chart drawing tools (rectangles, fib, trendlines persistence). All called out in the spec as Year 1+ scope; the architecture above is ready for them.

## Stack

Next.js 14 App Router · React 18 · TypeScript · TailwindCSS · Zustand (with persist) · react-grid-layout · TradingView Lightweight Charts · lucide-react · date-fns · nanoid.
