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
      {/* Subtle blue glow rising from the Earth's atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(70,140,255,0.10) 0%, rgba(0,0,0,0) 38%)"
        }}
        aria-hidden
      />

      {/* Eyebrow */}
      <div className="relative z-10 mb-5 spaced-display text-[10.5px] sm:text-[11px] text-falcon-gold uppercase">
        FALCON · A new terminal for retail investors
      </div>

      {/* The FALCON wordmark — present but compact, the editorial headline below carries the weight */}
      <h1
        className="relative z-10 font-display font-extralight uppercase brand-gradient leading-[0.9] text-center"
        style={{ fontSize: "clamp(40px, 7vw, 110px)", letterSpacing: "0.18em" }}
      >
        FALCON
      </h1>

      {/* Big editorial headline — the visual gravity of the hero */}
      <h2
        className="relative z-10 mt-8 font-display font-medium text-white text-center px-6 max-w-5xl leading-[1.04] tracking-[-0.02em]"
        style={{ fontSize: "clamp(40px, 6.4vw, 96px)" }}
      >
        See further.
        <span className="text-white/55"> Trade smarter.</span>
      </h2>

      {/* Tagline */}
      <p className="relative z-10 mt-7 max-w-xl text-center text-white text-[15.5px] sm:text-[17px] leading-[1.6] font-light px-6">
        Bloomberg-class research, real-time data, and an AI-native workspace —
        engineered for the next generation of investors.
      </p>

      {/* CTAs */}
      <div className="relative z-10 mt-9 flex items-center gap-3 flex-wrap justify-center px-6">
        {isLoggedIn ? (
          <Link
            href="/terminal"
            className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase"
          >
            Open Terminal <ArrowRight size={15} />
          </Link>
        ) : (
          <>
            <Link
              href="/login?mode=signup"
              className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase"
            >
              Create free account <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="btn-ghost inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      <div className="relative z-10 mt-4 text-[11px] uppercase tracking-[0.2em] text-white/55">
        $0 to start · no credit card needed
      </div>

      {/* The Earth — pinned to the bottom */}
      <div className="absolute left-0 right-0 bottom-0 h-[42svh] sm:h-[44svh] pointer-events-none">
        <EarthGlobe />
      </div>
    </section>
  );
}
