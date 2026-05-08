"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

export function CtaBand() {
  const acct = useAuth((s) => s.currentUserId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted && !!acct;

  return (
    <section id="about" className="relative py-28 sm:py-36 overflow-hidden">
      {/* Two slow concentric orbits as ornament */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(120vw,1500px)",
          height: "min(120vw,1500px)",
          borderRadius: "50%",
          border: "1px solid rgba(240, 193, 75, 0.07)",
          animation: "orbit 240s linear infinite"
        }}
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(80vw,1000px)",
          height: "min(80vw,1000px)",
          borderRadius: "50%",
          border: "1px dashed rgba(240, 193, 75, 0.06)",
          animation: "orbit 360s linear infinite reverse"
        }}
        aria-hidden
      />
      {/* A small luminous "moon" on one of the orbits */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(80vw,1000px)",
          height: "min(80vw,1000px)",
          animation: "orbit 360s linear infinite reverse"
        }}
        aria-hidden
      >
        <span
          className="absolute"
          style={{
            top: "0%",
            left: "50%",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(240, 193, 75, 0.95)",
            boxShadow: "0 0 30px rgba(240, 193, 75, 0.7), 0 0 80px rgba(240, 193, 75, 0.35)"
          }}
        />
      </div>

      <Reveal className="relative max-w-4xl mx-auto px-6 sm:px-10 text-center">
        <div className="spaced-display text-[10.5px] uppercase tracking-[0.4em] text-falcon-gold mb-7">
          The future of investing
        </div>
        <h2
          className="font-display font-medium text-white tracking-[-0.015em] leading-[1.04]"
          style={{ fontSize: "clamp(36px, 6vw, 84px)" }}
        >
          Welcome to the{" "}
          <span className="brand-gradient">retail revolution.</span>
        </h2>
        <p className="mt-7 text-white max-w-2xl mx-auto text-[15.5px] sm:text-[17px] leading-[1.65] font-light">
          Built by traders who refused to settle for what their broker offered. A terminal that
          respects your time, your capital, and your curiosity.
        </p>
        <div className="mt-10 flex items-center gap-3 flex-wrap justify-center">
          {isLoggedIn ? (
            <Link href="/terminal" className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase">
              Open your terminal <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link href="/login?mode=signup" className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase">
                Create free account <ArrowRight size={15} />
              </Link>
              <Link href="/login" className="btn-ghost inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase">
                Sign In
              </Link>
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
}
