"use client";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <Reveal>
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-falcon-gold/70" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-falcon-gold">
              About Falcon
            </span>
          </div>
          <h2 className="font-display font-medium text-white text-[clamp(30px,4.4vw,52px)] leading-[1.05] tracking-[-0.015em] max-w-3xl">
            We built the terminal we wished we had at 22.
          </h2>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-10 md:gap-16">
          <Reveal>
            <div className="space-y-5 text-white/85 text-[15px] leading-[1.7] font-light">
              <p>
                Falcon started as a side-project in a college dorm. We were
                trading on three monitors of free tools — TradingView in one
                tab, SEC EDGAR in another, Reddit in a third — and watching
                friends with Bloomberg access run circles around us.
              </p>
              <p>
                Pros don&apos;t win because they&apos;re smarter. They win because
                their tools are <span className="text-white">in one place</span>,
                <span className="text-white"> in real time</span>, and{" "}
                <span className="text-white">on one keyboard</span>. So we set
                out to build that — for the rest of us.
              </p>
              <p>
                Today Falcon ships sixteen native widgets, a streaming AI
                research engine, and live feeds from the places retail actually
                lives: filings, the tape, Reddit, X, and Stocktwits. No setup,
                no enterprise sales call, no five-figure annual.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="grid grid-cols-2 gap-3">
              <Stat k="Native widgets" v="16" />
              <Stat k="Streaming latency" v="<500ms" />
              <Stat k="Asset classes" v="7" />
              <Stat k="Tickers covered" v="11,000+" />
              <Stat k="Annual cost" v="$0 to start" />
              <Stat k="Setup time" v="30s" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
      <div className="text-falcon-gold font-display text-[28px] sm:text-[32px] font-medium tracking-tight leading-none">
        {v}
      </div>
      <div className="mt-2.5 text-[10.5px] uppercase tracking-[0.18em] text-white/55 font-mono">
        {k}
      </div>
    </div>
  );
}
