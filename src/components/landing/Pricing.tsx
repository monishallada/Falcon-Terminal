"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Reveal } from "./Reveal";

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
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <Reveal className="text-center mb-14">
          <div className="spaced-display text-[10.5px] uppercase tracking-[0.4em] text-falcon-gold mb-5">
            Pricing
          </div>
          <h2
            className="font-display font-medium text-white tracking-[-0.015em] leading-[1.05] mx-auto max-w-3xl"
            style={{ fontSize: "clamp(34px, 5vw, 60px)" }}
          >
            Three plans.{" "}
            <span className="text-white/55">No data feed wars.</span>
          </h2>
          <p className="mt-5 text-white/85 max-w-2xl mx-auto text-[15px] leading-[1.65] font-light">
            Cancel anytime. Annual plans save 20%. Universities, small funds, and trading desks —
            <a href="#about" className="text-falcon-gold hover:underline"> contact us</a> for enterprise pricing.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div
                className={clsx(
                  "rounded-2xl p-7 flex flex-col h-full",
                  t.highlight
                    ? "border border-falcon-gold/40 bg-gradient-to-b from-falcon-gold/[0.08] to-transparent shadow-[0_0_60px_-22px_rgba(240,193,75,0.4)]"
                    : "glass-card"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-white text-[15px] font-medium uppercase tracking-[0.2em]">{t.name}</span>
                  {t.highlight && (
                    <span className="text-[9.5px] uppercase tracking-[0.32em] px-2 py-1 rounded-full bg-falcon-gold/15 text-falcon-gold border border-falcon-gold/40">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display font-medium text-white text-[56px] leading-none tracking-tight">
                    {t.price}
                  </span>
                  <span className="text-white/55 text-[13px]">{t.cadence}</span>
                </div>
                <p className="mt-3 text-white/85 text-[13.5px] leading-[1.7] font-light">{t.blurb}</p>

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
                    <li key={f} className="flex items-start gap-3 text-white">
                      <Check size={14} className="mt-1 text-falcon-gold shrink-0" />
                      <span className="leading-[1.55] font-light">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center text-[11px] uppercase tracking-[0.32em] text-white/55">
          Live demo — all tiers fully unlocked while in beta
        </div>
      </div>
    </section>
  );
}
