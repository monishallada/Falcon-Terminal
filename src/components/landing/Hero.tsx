"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { StarField } from "./StarField";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";

// Canvas-based Earth — heavy first paint, so client-only and code-split.
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
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-black flex flex-col items-center justify-center pt-24 pb-32">
      {/* Backdrops */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#02030a] to-black" />
      <StarField density={420} />
      <div className="cosmic-grain" />
      {/* Real rotating 3D Earth — pinned to the bottom, peeks up exactly like
          the brand banner. The container occupies the lower 60% of the hero;
          the sphere center sits just below the bottom edge so only the upper
          arc of the planet is visible. The atmospheric rim shader inside the
          component provides the cyan transition into the void. */}
      <div className="absolute left-0 right-0 bottom-0 h-[60svh] sm:h-[58svh] pointer-events-none">
        <EarthGlobe />
      </div>

      {/* Faint top ornament — mirrors the small "FALCON" cap in the banner */}
      <div className="relative z-10 mb-8 spaced-display text-[10px] sm:text-[11px] text-falcon-gold/70 uppercase">
        <span className="opacity-70">A new terminal for retail investors</span>
      </div>

      {/* Wordmark */}
      <h1 className="relative z-10 font-display font-extralight uppercase brand-gradient leading-[0.9] text-center"
          style={{ fontSize: "clamp(72px, 14vw, 220px)", letterSpacing: "0.18em" }}>
        FALCON
      </h1>

      {/* Tagline */}
      <p className="relative z-10 mt-10 max-w-2xl text-center text-white/72 text-[15.5px] sm:text-[17px] leading-relaxed font-light px-6">
        Bloomberg-class research, real-time data, and an AI-native workspace —
        engineered for the next generation of investors.
      </p>

      {/* CTAs */}
      <div className="relative z-10 mt-12 flex items-center gap-3 flex-wrap justify-center px-6">
        {isLoggedIn ? (
          <Link
            href="/terminal"
            className="btn-gold inline-flex items-center gap-2 h-12 px-7 rounded-full text-[12.5px] uppercase"
          >
            Open Terminal <ArrowRight size={16} />
          </Link>
        ) : (
          <>
            <Link
              href="/login?mode=signup"
              className="btn-gold inline-flex items-center gap-2 h-12 px-7 rounded-full text-[12.5px] uppercase"
            >
              Create Account <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="btn-ghost inline-flex items-center gap-2 h-12 px-7 rounded-full text-[12.5px] uppercase"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Launch line — homage to the brand banner */}
      <div className="relative z-10 mt-20 spaced-display text-[10.5px] sm:text-[12px] text-white/50 uppercase tracking-[0.4em]">
        Live · Beta access open · 06.14.2026
      </div>

      {/* Bottom-edge gold rule fading both directions */}
      <div className="absolute bottom-0 left-0 right-0 gold-rule z-10" />
    </section>
  );
}
