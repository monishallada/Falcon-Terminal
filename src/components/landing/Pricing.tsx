"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import clsx from "clsx";

const TIERS = [
  {
    name: "Essential",
    price: "$29",
    cadence: "/ month",
    blurb: "For new traders building a daily ritual.",
    features: [
      "Charting with 15-min delayed data",
      "Watchlists & news feed",
      "5 AI research queries / day",
      "1 saved workspace"
    ],
    cta: "Start with Essential",
    highlight: false
  },
  {
    name: "Pro",
    price: "$99",
    cadence: "/ month",
    blurb: "For active investors. The full Falcon workspace.",
    features: [
      "Real-time data across asset classes",
      "Options flow + sentiment engine",
      "50 AI research queries / day",
      "Portfolio analytics + screener",
      "Unlimited workspaces"
    ],
    cta: "Get Pro",
    highlight: true
  },
  {
    name: "Elite",
    price: "$249",
    cadence: "/ month",
    blurb: "For power users running Falcon all day.",
    features: [
      "Everything in Pro",
      "Level II order book depth",
      "Unlimited AI queries",
      "API access",
      "Multi-device sync"
    ],
    cta: "Go Elite",
    highlight: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-black py-28 sm:py-36 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center gap-3">
          <span className="block w-6 h-px bg-falcon-gold/60" />
          <span className="spaced-display text-[10.5px] sm:text-[11px] uppercase tracking-[0.4em] text-falcon-gold/80">
            Pricing
          </span>
        </div>
        <h2 className="mt-6 font-display font-extralight text-white text-[clamp(30px,4.2vw,52px)] leading-[1.05] max-w-3xl">
          Three plans.
          <br />
          <span className="text-white/55">No data feed wars.</span>
        </h2>
        <p className="mt-6 text-white/55 text-[15px] leading-relaxed max-w-2xl font-light">
          Cancel anytime. Annual plans save 20%. Universities, small funds, and trading desks —
          <a href="#about" className="text-falcon-gold hover:underline"> contact us</a> for enterprise pricing.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={clsx(
                "rounded-2xl p-7 flex flex-col",
                t.highlight
                  ? "border border-falcon-gold/40 bg-gradient-to-b from-falcon-gold/[0.07] to-transparent shadow-[0_0_60px_-20px_rgba(240,193,75,0.35)]"
                  : "glass-card"
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-white text-[15px] font-medium uppercase tracking-[0.18em]">{t.name}</span>
                {t.highlight && (
                  <span className="text-[9.5px] uppercase tracking-[0.32em] px-2 py-1 rounded-full bg-falcon-gold/15 text-falcon-gold border border-falcon-gold/30">
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display font-extralight text-white text-[60px] leading-none">
                  {t.price}
                </span>
                <span className="text-white/40 text-[13px]">{t.cadence}</span>
              </div>
              <p className="mt-3 text-white/55 text-[13.5px] leading-relaxed font-light">{t.blurb}</p>

              <Link
                href="/login?mode=signup"
                className={clsx(
                  "mt-7 inline-flex items-center justify-center h-11 rounded-full text-[12px] uppercase tracking-[0.18em]",
                  t.highlight ? "btn-gold" : "btn-ghost"
                )}
              >
                {t.cta}
              </Link>

              <ul className="mt-7 space-y-3 text-[13.5px]">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-white/70">
                    <Check size={14} className="mt-1 text-falcon-gold shrink-0" />
                    <span className="leading-snug font-light">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-[12px] uppercase tracking-[0.32em] text-white/35">
          Live demo — all tiers fully unlocked while in beta
        </div>
      </div>
    </section>
  );
}
