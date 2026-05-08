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
    <section id="pricing" className="relative py-32 sm:py-44">
      <div className="celestial-rule mb-32 mx-auto max-w-7xl" />
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="block w-8 h-px bg-falcon-gold/70" />
            <span className="spaced-display text-[10.5px] sm:text-[11px] uppercase tracking-[0.4em] text-falcon-gold">
              Pricing
            </span>
          </div>
          <h2 className="mt-8 font-display font-extralight text-white text-[clamp(32px,4.6vw,58px)] leading-[1.05] max-w-3xl tracking-[-0.01em]">
            Three plans.
            <br />
            <span className="text-white/60">No data feed wars.</span>
          </h2>
          <p className="mt-8 text-white/70 text-[16px] leading-[1.85] max-w-2xl font-light">
            Cancel anytime. Annual plans save 20%. Universities, small funds, and trading desks —
            <a href="#about" className="text-falcon-gold hover:underline"> contact us</a> for enterprise pricing.
          </p>
        </Reveal>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 110}>
              <div
                className={clsx(
                  "rounded-2xl p-9 flex flex-col h-full",
                  t.highlight
                    ? "border border-falcon-gold/40 bg-gradient-to-b from-falcon-gold/[0.08] to-transparent shadow-[0_0_80px_-22px_rgba(240,193,75,0.4)]"
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
                <div className="mt-7 flex items-baseline gap-1.5">
                  <span className="font-display font-extralight text-white text-[64px] leading-none">
                    {t.price}
                  </span>
                  <span className="text-white/45 text-[13px]">{t.cadence}</span>
                </div>
                <p className="mt-4 text-white/65 text-[13.5px] leading-[1.75] font-light">{t.blurb}</p>

                <Link
                  href="/login?mode=signup"
                  className={clsx(
                    "mt-9 inline-flex items-center justify-center h-11 rounded-full text-[12px] uppercase tracking-[0.18em]",
                    t.highlight ? "btn-gold" : "btn-ghost"
                  )}
                >
                  {t.cta}
                </Link>

                <ul className="mt-9 space-y-3.5 text-[14px]">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-white/82">
                      <Check size={14} className="mt-1 text-falcon-gold shrink-0" />
                      <span className="leading-[1.6] font-light">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 text-center text-[12px] uppercase tracking-[0.32em] text-white/40">
          Live demo — all tiers fully unlocked while in beta
        </div>
      </div>
    </section>
  );
}
