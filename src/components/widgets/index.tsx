"use client";
import { WidgetType } from "@/lib/types";
import { ChartWidget } from "./ChartWidget";
import { WatchlistWidget } from "./WatchlistWidget";
import { QuoteWidget } from "./QuoteWidget";
import { TimeAndSalesWidget } from "./TimeAndSalesWidget";
import { Level2Widget } from "./Level2Widget";
import { TapeWidget } from "./TapeWidget";
import { NewsWidget } from "./NewsWidget";
import { SentimentWidget } from "./SentimentWidget";
import { AIChatWidget } from "./AIChatWidget";
import { PortfolioWidget } from "./PortfolioWidget";
import { ScreenerWidget } from "./ScreenerWidget";
import { OptionsFlowWidget } from "./OptionsFlowWidget";
import { MacroWidget } from "./MacroWidget";
import { HeatmapWidget } from "./HeatmapWidget";
import { CalendarWidget } from "./CalendarWidget";
import { NotesWidget } from "./NotesWidget";
import {
  CandlestickChart,
  Eye,
  Activity,
  List,
  Layers,
  Tv2,
  Newspaper,
  MessageCircle,
  Sparkles,
  Briefcase,
  Filter,
  Zap,
  Globe,
  LayoutGrid,
  CalendarDays,
  StickyNote
} from "lucide-react";

export function renderWidget(type: WidgetType, panelId: string) {
  switch (type) {
    case "chart": return <ChartWidget panelId={panelId} />;
    case "watchlist": return <WatchlistWidget panelId={panelId} />;
    case "quote": return <QuoteWidget panelId={panelId} />;
    case "time_sales": return <TimeAndSalesWidget panelId={panelId} />;
    case "level2": return <Level2Widget panelId={panelId} />;
    case "tape": return <TapeWidget panelId={panelId} />;
    case "news": return <NewsWidget panelId={panelId} />;
    case "sentiment": return <SentimentWidget panelId={panelId} />;
    case "ai_chat": return <AIChatWidget panelId={panelId} />;
    case "portfolio": return <PortfolioWidget panelId={panelId} />;
    case "screener": return <ScreenerWidget panelId={panelId} />;
    case "options_flow": return <OptionsFlowWidget panelId={panelId} />;
    case "macro": return <MacroWidget panelId={panelId} />;
    case "heatmap": return <HeatmapWidget panelId={panelId} />;
    case "calendar": return <CalendarWidget panelId={panelId} />;
    case "notes": return <NotesWidget panelId={panelId} />;
    default: return null;
  }
}

type IconType = React.ComponentType<{ size?: number | string; className?: string }>;
export const WIDGET_CATALOG: { type: WidgetType; name: string; description: string; icon: IconType }[] = [
  { type: "chart",        name: "Chart",          icon: CandlestickChart, description: "Candles, indicators, drawing tools." },
  { type: "watchlist",    name: "Watchlist",      icon: Eye,              description: "Sortable list with live ticks and sparklines." },
  { type: "quote",        name: "Quote",          icon: Activity,         description: "Single-symbol detail card." },
  { type: "time_sales",   name: "Time & Sales",   icon: List,             description: "Live print-by-print tape for one symbol." },
  { type: "level2",       name: "Level II",       icon: Layers,           description: "Order book depth by market maker." },
  { type: "tape",         name: "Ticker Tape",    icon: Tv2,              description: "Scrolling cross-asset price ticker." },
  { type: "news",         name: "News",           icon: Newspaper,        description: "Streaming wires, scored for sentiment." },
  { type: "sentiment",    name: "Sentiment",      icon: MessageCircle,    description: "Social mentions + bull/bear gauge." },
  { type: "ai_chat",      name: "AI Research",    icon: Sparkles,         description: "Streaming answers grounded in live data." },
  { type: "portfolio",    name: "Portfolio",      icon: Briefcase,        description: "Holdings, P&L, sector tilt, AI summary." },
  { type: "screener",     name: "Screener",       icon: Filter,           description: "Filter and rank the universe." },
  { type: "options_flow", name: "Options Flow",   icon: Zap,              description: "Unusual prints, sweeps, and PCR." },
  { type: "macro",        name: "Macro",          icon: Globe,            description: "Indices, FX, rates, commodities, crypto." },
  { type: "heatmap",      name: "Heatmap",        icon: LayoutGrid,       description: "Sector-grouped market heat." },
  { type: "calendar",     name: "Calendar",       icon: CalendarDays,     description: "Earnings and macro releases." },
  { type: "notes",        name: "Notes",          icon: StickyNote,       description: "Free-form trade journal per panel." }
];
