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
    <section id="about" className="relative py-40 sm:py-56 overflow-hidden">
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
        <div className="spaced-display text-[10.5px] uppercase tracking-[0.4em] text-falcon-gold mb-10">
          The future of investing
        </div>
        <h2 className="font-display font-extralight text-white text-[clamp(40px,7vw,96px)] leading-[1.02] tracking-[-0.01em]">
          Welcome to the
          <br />
          <span className="brand-gradient">retail revolution.</span>
        </h2>
        <p className="mt-12 text-white/75 text-[16px] sm:text-[18px] leading-[1.85] max-w-2xl mx-auto font-light">
          Falcon is built by traders who refused to settle. A terminal that respects your time,
          your capital, and your curiosity.
        </p>
        <div className="mt-14 flex items-center gap-4 flex-wrap justify-center">
          {isLoggedIn ? (
            <Link href="/terminal" className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase">
              Open Your Terminal <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link href="/login?mode=signup" className="btn-gold inline-flex items-center gap-2 h-12 px-8 rounded-full text-[12.5px] uppercase">
                Create Free Account <ArrowRight size={16} />
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
