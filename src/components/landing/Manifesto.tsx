"use client";
import { Reveal } from "./Reveal";

/**
 * Editorial mid-page manifesto. Big centered narrative copy on a darker band
 * with an aurora-style gradient and faint vertical light streaks behind it.
 * Acts as a beat between product sections — gives the page a rhythm of
 * "show product → state belief → show product".
 */
export function Manifesto() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Aurora — soft horizontal bands of color blending into the void */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none opacity-80"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(180, 110, 220, 0.22), rgba(0,0,0,0) 60%)",
            "radial-gradient(ellipse 55% 45% at 70% 18%, rgba(80, 200, 220, 0.20), rgba(0,0,0,0) 60%)",
            "radial-gradient(ellipse 70% 35% at 50% 8%, rgba(255, 110, 200, 0.14), rgba(0,0,0,0) 55%)",
            "radial-gradient(ellipse 50% 30% at 50% 55%, rgba(120, 90, 220, 0.10), rgba(0,0,0,0) 60%)"
          ].join(", ")
        }}
        aria-hidden
      />

      {/* Vertical light streaks — like aurora curtains */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="aurora-curtain" style={{ left: "12%", animationDelay: "-2s" }} />
        <div className="aurora-curtain" style={{ left: "30%", animationDelay: "-7s" }} />
        <div className="aurora-curtain" style={{ left: "55%", animationDelay: "-4s" }} />
        <div className="aurora-curtain" style={{ left: "72%", animationDelay: "-9s" }} />
        <div className="aurora-curtain" style={{ left: "88%", animationDelay: "-1s" }} />
      </div>

      <Reveal className="relative max-w-5xl mx-auto px-6 sm:px-10 text-center">
        <p
          className="font-display font-medium text-white tracking-[-0.015em] leading-[1.15]"
          style={{ fontSize: "clamp(28px, 4.6vw, 60px)" }}
        >
          The edge is no longer speed.
          <br className="hidden sm:block" />
          <span className="text-white/55"> It is clarity.</span>
        </p>
        <p
          className="mt-7 text-white/85 mx-auto max-w-3xl font-light leading-[1.7]"
          style={{ fontSize: "clamp(15px, 1.4vw, 18px)" }}
        >
          A great trade isn&apos;t luck — it&apos;s a thesis, a pattern read, a risk weighed.
          Falcon was built for the work that comes before the click. Your charts, your filings,
          your AI co-pilot — every tool a professional uses, in one workspace, available the
          moment you sign in.
        </p>
      </Reveal>
    </section>
  );
}
