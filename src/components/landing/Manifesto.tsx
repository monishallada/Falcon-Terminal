"use client";
import { Reveal } from "./Reveal";

/**
 * Editorial beat between product sections. No animated curtains anymore —
 * those were a frame-budget hog for almost no visual payoff on a static
 * page. Just type, a subtle wash, and breathing room.
 */
export function Manifesto() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <Reveal>
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-falcon-gold/70" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-falcon-gold">
              The thesis
            </span>
          </div>
          <p
            className="font-display font-medium text-white tracking-[-0.015em] leading-[1.1]"
            style={{ fontSize: "clamp(28px, 4.2vw, 56px)" }}
          >
            The edge isn&apos;t speed anymore.
            <br />
            <span className="text-white/55">It&apos;s clarity.</span>
          </p>
          <p
            className="mt-6 text-white/80 max-w-2xl font-light leading-[1.7]"
            style={{ fontSize: "clamp(15px, 1.3vw, 17px)" }}
          >
            A trade isn&apos;t the click. It&apos;s the hours of reading filings,
            comparing tickers, watching tape, arguing with yourself. Falcon was
            built for that work — not the click after.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
