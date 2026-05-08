"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";

const EarthGlobe = dynamic(() => import("./EarthGlobe"), {
  ssr: false,
  loading: () => null
});

export function Hero() {
  const acct = useAuth((s) => s.currentUserId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted && !!acct;

  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Aurora curtains — vertical pink/magenta light streaks rising from
          the upper third, set behind the headline. The Earth pinned to the
          bottom anchors the scene. */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Broad horizontal aurora wash across the upper third */}
        <div
          className="absolute inset-x-0 top-0 h-[55%]"
          style={{
            background: [
              "radial-gradient(ellipse 70% 60% at 30% 30%, rgba(220, 90, 200, 0.28), transparent 65%)",
              "radial-gradient(ellipse 60% 50% at 70% 25%, rgba(140, 90, 230, 0.26), transparent 65%)",
              "radial-gradient(ellipse 80% 40% at 50% 12%, rgba(255, 110, 200, 0.18), transparent 60%)"
            ].join(", ")
          }}
        />
        {/* Curtains */}
        <div className="aurora-hero warm"  style={{ left: "8%",  animationDelay: "-1s" }} />
        <div className="aurora-hero"       style={{ left: "20%", animationDelay: "-5s" }} />
        <div className="aurora-hero alt"   style={{ left: "33%", animationDelay: "-3s" }} />
        <div className="aurora-hero"       style={{ left: "46%", animationDelay: "-8s" }} />
        <div className="aurora-hero warm"  style={{ left: "58%", animationDelay: "-4s" }} />
        <div className="aurora-hero alt"   style={{ left: "70%", animationDelay: "-2s" }} />
        <div className="aurora-hero"       style={{ left: "82%", animationDelay: "-6s" }} />
        <div className="aurora-hero warm"  style={{ left: "92%", animationDelay: "-9s" }} />
        {/* Soft black fade so curtains dissolve before they meet the Earth */}
        <div
          className="absolute inset-x-0 top-[40%] h-[20%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)"
          }}
        />
      </div>

      {/* Eyebrow / brand */}
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <span className="block w-1.5 h-1.5 rounded-full bg-falcon-gold animate-pulse" />
        <span className="spaced-display text-[10.5px] sm:text-[11px] uppercase text-white">
          Falcon · A new terminal for retail investors
        </span>
      </div>

      {/* Big bold centered headline — the visual climax */}
      <h1
        className="relative z-10 font-display font-bold text-white text-center px-6 max-w-[1100px] leading-[0.95] tracking-[-0.025em]"
        style={{ fontSize: "clamp(46px, 9vw, 144px)" }}
      >
        Built for the work
        <br className="hidden sm:block" />
        before the trade.
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 mt-8 max-w-2xl text-center text-white text-[15.5px] sm:text-[18px] leading-[1.5] font-light px-6">
        Real-time charts, live filings, and an AI co-pilot — the institutional
        toolkit, in one workspace, available the moment you sign in.
      </p>

      {/* CTAs — primary white pill, secondary ghost */}
      <div className="relative z-10 mt-10 flex items-center gap-3 flex-wrap justify-center px-6">
        {isLoggedIn ? (
          <Link
            href="/terminal"
            className="btn-white inline-flex items-center gap-2 h-[52px] px-9 rounded-full text-[13px] uppercase"
          >
            Open Terminal <ArrowRight size={15} />
          </Link>
        ) : (
          <>
            <Link
              href="/login?mode=signup"
              className="btn-white inline-flex items-center gap-2 h-[52px] px-9 rounded-full text-[13px] uppercase"
            >
              Create free account <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="btn-ghost inline-flex items-center gap-2 h-[52px] px-9 rounded-full text-[13px] uppercase"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Helper line */}
      <div className="relative z-10 mt-5 text-[12px] text-white/75">
        Free to start · No credit card required
      </div>

      {/* The Earth — pinned to the bottom */}
      <div className="absolute left-0 right-0 bottom-0 h-[44svh] sm:h-[46svh] pointer-events-none">
        <EarthGlobe />
      </div>
    </section>
  );
}
