"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";

export function CtaBand() {
  const acct = useAuth((s) => s.currentUserId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted && !!acct;

  return (
    <section id="about" className="relative bg-black py-32 sm:py-40 border-t border-white/5 overflow-hidden">
      {/* A faint orbital ring as ornament */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(120vw,1400px)",
          height: "min(120vw,1400px)",
          borderRadius: "50%",
          border: "1px solid rgba(240, 193, 75, 0.06)",
          animation: "orbit 240s linear infinite"
        }}
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(80vw,900px)",
          height: "min(80vw,900px)",
          borderRadius: "50%",
          border: "1px dashed rgba(240, 193, 75, 0.05)",
          animation: "orbit 360s linear infinite reverse"
        }}
        aria-hidden
      />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-10 text-center">
        <div className="spaced-display text-[10.5px] uppercase tracking-[0.4em] text-falcon-gold/70 mb-8">
          The future of investing
        </div>
        <h2 className="font-display font-extralight text-white text-[clamp(36px,6vw,80px)] leading-[1.05] tracking-tight">
          Welcome to the
          <br />
          <span className="brand-gradient">retail revolution.</span>
        </h2>
        <p className="mt-8 text-white/55 text-[15.5px] leading-relaxed max-w-2xl mx-auto font-light">
          Falcon is built by traders who refused to settle. A terminal that respects your time,
          your capital, and your curiosity.
        </p>
        <div className="mt-12 flex items-center gap-3 flex-wrap justify-center">
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
      </div>
    </section>
  );
}
