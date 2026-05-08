"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
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
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center pt-32 pb-40 overflow-hidden">
      {/* Hero-specific dim toward the bottom so the rising Earth feels brighter
          than the surrounding void */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 110%, rgba(70,140,255,0.10) 0%, rgba(0,0,0,0) 38%)"
        }}
        aria-hidden
      />

      {/* Faint top ornament — mirrors the small "FALCON" cap in the banner */}
      <div className="relative z-10 mb-10 spaced-display text-[10px] sm:text-[11px] text-falcon-gold/80 uppercase">
        A new terminal for retail investors
      </div>

      {/* Wordmark */}
      <h1
        className="relative z-10 font-display font-extralight uppercase brand-gradient leading-[0.9] text-center"
        style={{ fontSize: "clamp(72px, 14vw, 220px)", letterSpacing: "0.18em" }}
      >
        FALCON
      </h1>

      {/* Tagline */}
      <p className="relative z-10 mt-12 max-w-2xl text-center text-white/85 text-[16px] sm:text-[18.5px] leading-[1.7] font-light px-6">
        Bloomberg-class research, real-time data, and an AI-native workspace —
        engineered for the next generation of investors.
      </p>

      {/* CTAs */}
      <div className="relative z-10 mt-14 flex items-center gap-4 flex-wrap justify-center px-6">
        {isLoggedIn ? (
          <Link
            href="/terminal"
            className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase"
          >
            Open Terminal <ArrowRight size={16} />
          </Link>
        ) : (
          <>
            <Link
              href="/login?mode=signup"
              className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase"
            >
              Create Account <ArrowRight size={16} />
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

      {/* Launch line — homage to the brand banner */}
      <div className="relative z-10 mt-24 spaced-display text-[10.5px] sm:text-[12px] text-white/60 uppercase tracking-[0.4em]">
        Live · Beta access open · 06.14.2026
      </div>

      {/* Real rotating 3D Earth — pinned to the bottom, peeks up exactly like
          the brand banner. The container occupies the lower portion of the
          hero; the sphere center sits just below the bottom edge so only the
          upper arc of the planet is visible. */}
      <div className="absolute left-0 right-0 bottom-0 h-[60svh] sm:h-[58svh] pointer-events-none">
        <EarthGlobe />
      </div>
    </section>
  );
}
