"use client";
import { ArrowDown, ArrowUp, Flame, Bell, MessageSquare } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * Live-feel "what's moving right now" section. Three columns:
 *   1. Top US gainers (large-cap)
 *   2. Small-cap momentum / high-of-day
 *   3. Live alerts + social signal feed (Reddit / X)
 *
 * Data is static mock for the marketing surface — the real terminal wires
 * these to the same engine as the LiveTickers, but we keep this cheap so
 * the landing stays snappy.
 */
export function Movers() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="block w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-falcon-gold">
                  Live · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} session
                </span>
              </div>
              <h2 className="font-display font-medium text-white text-[clamp(28px,3.6vw,44px)] leading-[1.05] tracking-[-0.015em]">
                What&apos;s moving right now.
              </h2>
            </div>
            <p className="text-white/65 text-[13.5px] max-w-md leading-[1.55]">
              Top gainers, small-cap momentum, and social chatter — refreshed
              tick-by-tick the moment you open the terminal.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-3">
          <Reveal>
            <MoverPanel
              title="Top US gainers"
              icon={<ArrowUp size={11} />}
              rows={[
                { sym: "PLTR", name: "Palantir",        px: "82.14",  chg: "+8.2%",  vol: "118M" },
                { sym: "SMCI", name: "Super Micro",     px: "44.91",  chg: "+6.5%",  vol: "94M"  },
                { sym: "COIN", name: "Coinbase",        px: "318.42", chg: "+5.9%",  vol: "21M"  },
                { sym: "AMD",  name: "Advanced Micro",  px: "162.30", chg: "+4.7%",  vol: "62M"  },
                { sym: "MU",   name: "Micron",          px: "118.05", chg: "+4.1%",  vol: "44M"  },
                { sym: "NVDA", name: "NVIDIA",          px: "138.92", chg: "+3.8%",  vol: "201M" }
              ]}
            />
          </Reveal>

          <Reveal delay={80}>
            <MoverPanel
              title="Small-cap momentum · HOD"
              icon={<Flame size={11} />}
              accent
              rows={[
                { sym: "BNAI", name: "Brand Engagement", px: "4.12",  chg: "+184%", vol: "82M", hod: true },
                { sym: "GWAV", name: "Greenwave Tech",   px: "2.30",  chg: "+72%",  vol: "41M", hod: true },
                { sym: "NUKK", name: "Nukkleus",         px: "1.84",  chg: "+58%",  vol: "29M", hod: false },
                { sym: "SOPA", name: "Society Pass",     px: "3.05",  chg: "+44%",  vol: "18M", hod: true },
                { sym: "TIVC", name: "Tivic Health",     px: "5.20",  chg: "+31%",  vol: "12M", hod: false },
                { sym: "HKD",  name: "AMTD Digital",     px: "8.91",  chg: "+22%",  vol: "9M",  hod: false }
              ]}
            />
          </Reveal>

          <Reveal delay={160}>
            <AlertsPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

interface MoverRow {
  sym: string;
  name: string;
  px: string;
  chg: string;
  vol: string;
  hod?: boolean;
}

function MoverPanel({
  title,
  icon,
  rows,
  accent
}: {
  title: string;
  icon: React.ReactNode;
  rows: MoverRow[];
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border bg-black/40 backdrop-blur-sm overflow-hidden " +
        (accent ? "border-falcon-gold/30" : "border-white/8")
      }
    >
      <div className="h-8 px-3 flex items-center gap-2 border-b border-white/6 bg-white/[0.02]">
        <span className={accent ? "text-falcon-gold" : "text-white/65"}>{icon}</span>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white">
          {title}
        </span>
        <span className="ml-auto text-[9.5px] font-mono text-white/40 uppercase tracking-wider">
          live
        </span>
      </div>
      <table className="w-full text-[11.5px] font-mono">
        <thead className="text-white/40 uppercase text-[9.5px] tracking-wider">
          <tr className="border-b border-white/6">
            <th className="text-left px-3 py-2 font-medium">Sym</th>
            <th className="text-right px-3 py-2 font-medium">Last</th>
            <th className="text-right px-3 py-2 font-medium">Chg</th>
            <th className="text-right px-3 py-2 font-medium">Vol</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const up = r.chg.startsWith("+");
            return (
              <tr key={r.sym} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-3 py-2">
                  <div className="text-white flex items-center gap-1.5">
                    {r.sym}
                    {r.hod && (
                      <span className="text-[8px] font-bold text-falcon-gold bg-falcon-gold/15 px-1 rounded">HOD</span>
                    )}
                  </div>
                  <div className="text-white/40 text-[9.5px]">{r.name}</div>
                </td>
                <td className="text-right px-3 py-2 text-white">{r.px}</td>
                <td className={"text-right px-3 py-2 " + (up ? "text-bull" : "text-bear")}>
                  <span className="inline-flex items-center gap-0.5">
                    {up ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
                    {r.chg.replace(/^[+-]/, "")}
                  </span>
                </td>
                <td className="text-right px-3 py-2 text-white/65">{r.vol}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AlertsPanel() {
  const alerts = [
    { type: "alert" as const, time: "09:42", text: "BNAI broke HOD — +184% on 82M shares", tag: "MOMENTUM" },
    { type: "social" as const, time: "09:39", text: "r/wallstreetbets · GWAV mentions +1,240% (24h)", tag: "REDDIT" },
    { type: "alert" as const, time: "09:36", text: "PLTR · unusual call sweep, $2.4M premium", tag: "FLOW" },
    { type: "social" as const, time: "09:31", text: "X · $NVDA cashtag velocity 4.1× weekly avg", tag: "X" },
    { type: "alert" as const, time: "09:24", text: "SMCI volume spike — 3.5× 20-day average", tag: "VOLUME" },
    { type: "social" as const, time: "09:18", text: "Stocktwits · $COIN sentiment flipped bullish", tag: "STWITS" }
  ];
  return (
    <div className="rounded-xl border border-white/8 bg-black/40 backdrop-blur-sm overflow-hidden h-full">
      <div className="h-8 px-3 flex items-center gap-2 border-b border-white/6 bg-white/[0.02]">
        <Bell size={11} className="text-bull" />
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white">
          Alerts &amp; social signals
        </span>
        <span className="ml-auto text-[9.5px] font-mono text-bull uppercase tracking-wider animate-pulse">
          ● live
        </span>
      </div>
      <ul className="divide-y divide-white/5">
        {alerts.map((a, i) => (
          <li key={i} className="px-3 py-2.5 flex items-start gap-2.5">
            <span
              className={
                "mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 " +
                (a.type === "social"
                  ? "bg-falcon-gold/15 text-falcon-gold"
                  : "bg-bull/15 text-bull")
              }
            >
              {a.type === "social" ? <MessageSquare size={10} /> : <Bell size={10} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[9.5px] uppercase font-mono tracking-wider text-white/45">
                <span>{a.time}</span>
                <span>·</span>
                <span
                  className={
                    a.type === "social" ? "text-falcon-gold" : "text-white/55"
                  }
                >
                  {a.tag}
                </span>
              </div>
              <div className="text-white/90 text-[12px] mt-0.5 leading-snug">{a.text}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
