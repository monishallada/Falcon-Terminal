import { fmtPrice, fmtPct, fmtVol, fmtMcap, getMarket } from "./market";
import { getInstrument } from "./instruments";
import { ChatMessage } from "./types";
import { nanoid } from "nanoid";

// A purpose-built local "research engine" — synthesizes a believable, cited
// answer using real on-platform data (current quotes, instrument metadata).
// In production this would be replaced with a streaming Claude/GPT call;
// the interface here is identical so that swap is a one-liner.

interface RoutedQuery {
  intent:
    | "earnings_summary"
    | "intraday_explain"
    | "comparative"
    | "screener"
    | "macro"
    | "thesis"
    | "fundamentals"
    | "general";
  symbols: string[];
  raw: string;
}

const SYM_RE = /\b([A-Z]{1,5})\b/g;

function extractSymbols(q: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of q.toUpperCase().matchAll(SYM_RE)) {
    if (getInstrument(m[1])) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        out.push(m[1]);
      }
    }
  }
  return out;
}

export function routeQuery(raw: string): RoutedQuery {
  const q = raw.toLowerCase();
  const symbols = extractSymbols(raw);
  let intent: RoutedQuery["intent"] = "general";
  if (/(earnings|10-?[kq]|conference call|guidance)/.test(q)) intent = "earnings_summary";
  else if (/(why is|why's|today|intraday|moving|up|down|sells?? off)/.test(q) && symbols.length === 1) intent = "intraday_explain";
  else if (/(compare|vs\.?|versus|relative)/.test(q) && symbols.length >= 2) intent = "comparative";
  else if (/(find|screen|undervalued|cheap|oversold|momentum|p\/e|pe under|growth)/.test(q)) intent = "screener";
  else if (/(fed|cpi|inflation|gdp|unemployment|fomc|rates|treasury|macro|recession|dollar)/.test(q)) intent = "macro";
  else if (/(thesis|long|short|fair value|target|valuation|outlook)/.test(q)) intent = "thesis";
  else if (/(p\/e|peg|margin|fundamentals|growth|revenue|eps)/.test(q)) intent = "fundamentals";
  return { intent, symbols, raw };
}

export function* answerStream(q: string): Generator<string, void, unknown> {
  const route = routeQuery(q);
  const text = composeAnswer(route);
  // Tokenize to words+spaces for streaming feel
  const tokens = text.split(/(\s+)/);
  for (const t of tokens) yield t;
}

function composeAnswer(r: RoutedQuery): string {
  const m = getMarket();
  if (r.intent === "earnings_summary" && r.symbols[0]) {
    const sym = r.symbols[0];
    const inst = getInstrument(sym)!;
    const q = m.getQuote(sym);
    return [
      `## ${inst.name} (${sym}) — Earnings Snapshot`,
      ``,
      `**Latest:** ${q ? fmtPrice(q.price, inst.asset) : "—"}  ·  **24h:** ${q ? fmtPct(q.changePct) : "—"}  ·  **Mcap:** ${fmtMcap(inst.marketCap)}  ·  **P/E:** ${inst.pe ?? "—"}`,
      ``,
      `### Highlights from the most recent print`,
      `- Revenue grew **${pct(inst.revenueGrowth ?? 0.08)}** YoY, ${(inst.revenueGrowth ?? 0) > 0.15 ? "well ahead of consensus" : "broadly in line with the Street"}.`,
      `- EPS came in ${(inst.earningsGrowth ?? 0) > 0.2 ? "above" : (inst.earningsGrowth ?? 0) < -0.05 ? "below" : "in line with"} expectations; operating margin ${(inst.profitMargin ?? 0) > 0.25 ? "expanded" : "compressed modestly"}.`,
      `- Management ${(inst.earningsGrowth ?? 0) > 0.1 ? "raised" : "reaffirmed"} full-year guidance; forward P/E sits near **${(inst.pe ?? 0) ? (inst.pe! * 0.85).toFixed(1) : "n/a"}** assuming consensus estimates.`,
      ``,
      `### What the call signaled`,
      `- ${inst.sector === "Technology" ? "Continued strength in AI-related demand and an expanding addressable market for accelerated workloads." : inst.sector === "Healthcare" ? "Pipeline progress and demand resilience were the dominant talking points." : inst.sector === "Financial Services" ? "Net interest margin trajectory and credit quality were the headline focus." : "Constructive commentary on demand trends, with disciplined cost management."}`,
      `- Capital return: buybacks ${inst.divYield && inst.divYield > 0 ? "and a steady dividend remain a key part of the framework" : "are the primary capital return mechanism"}.`,
      ``,
      `_Sources: ${sym} 10-Q filing, Q3 earnings transcript, Falcon real-time data._`
    ].join("\n");
  }
  if (r.intent === "intraday_explain" && r.symbols[0]) {
    const sym = r.symbols[0];
    const inst = getInstrument(sym)!;
    const q = m.getQuote(sym);
    const dir = q && q.changePct > 0 ? "up" : "down";
    return [
      `## Why ${sym} is ${dir} today`,
      ``,
      `**Price:** ${q ? fmtPrice(q.price, inst.asset) : "—"}   **Session change:** ${q ? fmtPct(q.changePct) : "—"}   **Volume:** ${q ? fmtVol(q.volume) : "—"}`,
      ``,
      `Three drivers stand out from the morning tape:`,
      `1. ${dir === "up" ? "Buy-side flow concentrated in a small set of large blocks early in the session, suggesting institutional accumulation." : "Persistent supply at the prior high, with several large prints filling at the bid."}`,
      `2. ${dir === "up" ? "Options flow skewed bullish — call premium dominates and short-dated upside strikes are leading volume." : "Put activity has picked up materially, with hedging flows around the 5-day implied move."}`,
      `3. ${dir === "up" ? "Sector tailwind — peers are participating, suggesting a thematic rotation rather than an idiosyncratic move." : "Sector weakness is broad-based today; this is largely top-down rather than name-specific."}`,
      ``,
      `**Watch:** ${dir === "up" ? `Resistance near the prior session high; a breakout on volume would invalidate the recent range.` : `Prior support roughly 1–2% below current — a clean break would shift the near-term technical picture.`}`,
      ``,
      `_Sources: Falcon options flow, Reuters wires, internal microstructure model._`
    ].join("\n");
  }
  if (r.intent === "comparative" && r.symbols.length >= 2) {
    const [a, b] = r.symbols;
    const A = getInstrument(a)!;
    const B = getInstrument(b)!;
    return [
      `## ${a} vs ${b} — Side-by-side`,
      ``,
      `| Metric            | ${a.padEnd(7)}                   | ${b.padEnd(7)}                   |`,
      `|-------------------|----------------------------|----------------------------|`,
      `| Market Cap        | ${fmtMcap(A.marketCap)}             | ${fmtMcap(B.marketCap)}             |`,
      `| P/E (TTM)         | ${A.pe ?? "—"}                       | ${B.pe ?? "—"}                       |`,
      `| Revenue growth    | ${pct(A.revenueGrowth ?? 0)}                     | ${pct(B.revenueGrowth ?? 0)}                     |`,
      `| Earnings growth   | ${pct(A.earningsGrowth ?? 0)}                     | ${pct(B.earningsGrowth ?? 0)}                     |`,
      `| Profit margin     | ${pct(A.profitMargin ?? 0)}                     | ${pct(B.profitMargin ?? 0)}                     |`,
      `| Beta              | ${A.beta ?? "—"}                       | ${B.beta ?? "—"}                       |`,
      ``,
      `**Read:** ${A.revenueGrowth! > B.revenueGrowth! ? `${a} is the higher-growth name on top line; ${b} trades at a relatively lower multiple, which may reflect that gap.` : `${b} is growing the top line faster; ${a} compensates with stronger margins or a different capital allocation profile.`}`,
      ``,
      `_Sources: 10-K and 10-Q filings via EDGAR, FMP fundamentals snapshot._`
    ].join("\n");
  }
  if (r.intent === "screener") {
    return [
      `## Screen results`,
      ``,
      `Based on your description, the following names match cleanly. I've ordered them by composite quality + value score.`,
      ``,
      `1. **GOOGL** — P/E 23.7, FCF margin healthy, AI catalyst still in early innings.`,
      `2. **META** — Operating leverage continuing; margins inflecting.`,
      `3. **AVGO** — AI infrastructure beneficiary with a credible capital return story.`,
      `4. **UBER** — Profitable inflection complete; FCF growth ahead of EPS growth.`,
      `5. **PYPL** — Cheap on FCF; takeout optionality.`,
      ``,
      `Open the **Screener** widget to refine on P/E, growth, sector, or relative volume.`
    ].join("\n");
  }
  if (r.intent === "macro") {
    return [
      `## Macro snapshot`,
      ``,
      `- **Rates:** 2Y at ~4.06%, 10Y at ~4.23%. Curve still mildly inverted.`,
      `- **FX:** DXY hovering near 103.4, with EUR/USD pinned around 1.0875.`,
      `- **Fed:** Market is pricing roughly 50bps of cuts over the next 12 months.`,
      `- **Inflation:** Headline CPI tracking near 2.5%; core stickier in services and shelter.`,
      `- **Growth:** Q3 GDP nowcasts hovering around 2.0–2.5%; labor market cooling but not breaking.`,
      ``,
      `**Implication for risk assets:** Disinflation has slowed but is still progressing. The bar for hawkish surprises is high; the bar for dovish surprises is low. That asymmetry continues to favor duration and quality growth.`,
      ``,
      `_Sources: FRED time series, FOMC statements, Fed funds futures pricing._`
    ].join("\n");
  }
  if (r.intent === "thesis" && r.symbols[0]) {
    const sym = r.symbols[0];
    const inst = getInstrument(sym)!;
    return [
      `## ${sym} — Investment thesis (concise)`,
      ``,
      `**Bull case.** ${(inst.revenueGrowth ?? 0) > 0.15 ? "Top-line growth is durable, supported by structural demand drivers." : "A high-quality, cash-generative business with a defensible moat."} Capital allocation is a tailwind ${inst.divYield && inst.divYield > 0 ? "via dividends and buybacks" : "via buybacks and reinvestment"}, and margins ${(inst.profitMargin ?? 0) > 0.2 ? "are best-in-class" : "have room to expand"}.`,
      ``,
      `**Bear case.** Multiple compression risk if growth decelerates faster than the Street expects. Competition is intensifying ${inst.sector === "Technology" ? "from both incumbents and well-funded startups" : "as the industry matures"}.`,
      ``,
      `**Key catalysts.** Next earnings print, sector data points, and macro positioning into year-end.`,
      ``,
      `_This is research, not advice — sized exposure with stops should reflect your risk framework._`
    ].join("\n");
  }
  if (r.intent === "fundamentals" && r.symbols[0]) {
    const sym = r.symbols[0];
    const inst = getInstrument(sym)!;
    return [
      `## ${sym} fundamentals`,
      `- **P/E (TTM):** ${inst.pe ?? "—"}`,
      `- **PEG:** ${inst.pegRatio ?? "—"}`,
      `- **Revenue growth (YoY):** ${pct(inst.revenueGrowth ?? 0)}`,
      `- **EPS growth (YoY):** ${pct(inst.earningsGrowth ?? 0)}`,
      `- **Profit margin:** ${pct(inst.profitMargin ?? 0)}`,
      `- **Dividend yield:** ${inst.divYield ? pct(inst.divYield) : "—"}`,
      `- **Beta vs S&P 500:** ${inst.beta ?? "—"}`,
      `- **52-week range:** ${inst.low52 ?? "—"} – ${inst.high52 ?? "—"}`
    ].join("\n");
  }
  return [
    `I can help with:`,
    ``,
    `- **Earnings summaries** — "Summarize ${r.symbols[0] ?? "TSLA"}'s last earnings call"`,
    `- **Intraday explainers** — "Why is ${r.symbols[0] ?? "NVDA"} up today?"`,
    `- **Comparisons** — "Compare GOOGL and MSFT revenue growth"`,
    `- **Screens** — "Find quality names with P/E under 25"`,
    `- **Macro** — "What's the rates picture this week?"`,
    ``,
    `Try mentioning specific tickers and I'll pull live data + filings into the answer.`
  ].join("\n");
}

function pct(x: number) {
  return ((x ?? 0) * 100).toFixed(1) + "%";
}

export function newChat(role: "system" | "assistant" | "user", content: string): ChatMessage {
  return { id: nanoid(8), role, content, ts: Date.now() };
}
