"use client";

const STATS = [
  { value: "60+", label: "Instruments" },
  { value: "16", label: "Live widgets" },
  { value: "<500ms", label: "Tick latency" },
  { value: "10k", label: "Concurrent ws" }
];

export function Stats() {
  return (
    <section className="relative bg-black py-16 sm:py-24 border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display font-extralight text-falcon-gold leading-none"
                 style={{ fontSize: "clamp(36px,5vw,64px)", letterSpacing: "0.04em" }}>
              {s.value}
            </div>
            <div className="mt-3 text-[11px] sm:text-[12px] uppercase tracking-[0.32em] text-white/45">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
