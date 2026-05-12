"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";

export function Hero() {
  const acct = useAuth((s) => s.currentUserId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted && !!acct;

  return (
    <section className="relative pt-28 pb-10 sm:pt-32 sm:pb-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Status bar */}
        <div className="flex items-center gap-3 mb-7">
          <span className="block w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-white/65">
            FALCON · v0.9 BETA · NYSE OPEN
          </span>
          <span className="ml-auto hidden md:flex items-center gap-4 font-mono text-[10.5px] text-white/55">
            <span><span className="text-white/40">SPX</span> <span className="text-white">5832.92</span> <span className="text-bull">+0.42%</span></span>
            <span><span className="text-white/40">NDX</span> <span className="text-white">20492.10</span> <span className="text-bull">+0.61%</span></span>
            <span><span className="text-white/40">VIX</span> <span className="text-white">15.32</span> <span className="text-bear">-1.87%</span></span>
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-semibold text-white tracking-[-0.025em] leading-[0.95] max-w-[16ch]"
          style={{ fontSize: "clamp(44px, 8vw, 116px)" }}
        >
          A trader&apos;s terminal,
          <br />
          <span className="text-falcon-gold">without the $24k bill.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-white/80 text-[15.5px] sm:text-[17px] leading-[1.55] font-light">
          Charts, filings, flow, sentiment, and an AI co-pilot — sixteen
          widgets, one workspace. Built by retail traders, for retail traders.
        </p>

        <div className="mt-9 flex items-center gap-3 flex-wrap">
          {isLoggedIn ? (
            <Link
              href="/terminal"
              className="btn-white inline-flex items-center gap-2 h-[48px] px-7 rounded-full text-[12.5px] uppercase"
            >
              Open Terminal <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link
                href="/login?mode=signup"
                className="btn-white inline-flex items-center gap-2 h-[48px] px-7 rounded-full text-[12.5px] uppercase"
              >
                Start free <ArrowRight size={15} />
              </Link>
              <Link
                href="/login"
                className="btn-ghost inline-flex items-center gap-2 h-[48px] px-7 rounded-full text-[12.5px] uppercase"
              >
                Sign in
              </Link>
            </>
          )}
          <span className="ml-1 text-[11.5px] text-white/55 font-mono">
            no card · cancel anytime
          </span>
        </div>
      </div>
    </section>
  );
}
