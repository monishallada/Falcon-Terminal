"use client";
import { Reveal } from "./Reveal";

const STATS = [
  { value: "60+", label: "Instruments" },
  { value: "16", label: "Live widgets" },
  { value: "<500ms", label: "Tick latency" },
  { value: "10k", label: "Concurrent ws" }
];

export function Stats() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="celestial-rule mb-24 mx-auto max-w-7xl" />
      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-2 md:grid-cols-4 gap-y-14 gap-x-6">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="text-center">
            <div
              className="font-display font-extralight text-falcon-gold leading-none"
              style={{ fontSize: "clamp(40px,5.4vw,72px)", letterSpacing: "0.04em", textShadow: "0 0 40px rgba(240, 193, 75, 0.25)" }}
            >
              {s.value}
            </div>
            <div className="mt-4 text-[11px] sm:text-[12px] uppercase tracking-[0.36em] text-white/55">
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
      <div className="celestial-rule mt-24 mx-auto max-w-7xl" />
    </section>
  );
}
