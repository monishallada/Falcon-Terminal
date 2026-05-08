"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import clsx from "clsx";
import { Reveal } from "./Reveal";

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "What's included in beta access?",
    a:
      "All paid tiers (Essential, Pro, and Elite) are unlocked while the product is in beta. You get the full workspace engine, every widget, and unlimited AI queries. We freeze your account on a tier of your choosing when beta ends — no surprise charges."
  },
  {
    q: "Can I import my existing portfolio?",
    a:
      "Yes. You can enter positions manually, paste a Robinhood / Schwab / TD Ameritrade CSV export, and brokerage OAuth sync (Plaid-backed) is on the roadmap for the months following GA. Imported holdings power the Portfolio widget — live P&L, sector tilt, beta, and the AI summary."
  },
  {
    q: "How does Falcon AI work?",
    a:
      "Every answer is grounded in real, citable sources — SEC filings (EDGAR), earnings transcripts, analyst notes, and the live tick stream — pulled through a RAG pipeline. The model is provider-agnostic; we currently route to Claude and GPT-4. You see the citations alongside every response."
  },
  {
    q: "Is my data secure?",
    a:
      "Workspace state, watchlists, and portfolio details are encrypted at rest, scoped to your account, and never sold. We don't sell order flow because we don't see your orders — Falcon is a research and analytics terminal, not a brokerage."
  },
  {
    q: "What devices does Falcon support?",
    a:
      "The web terminal runs on any modern desktop browser. A cross-platform Electron desktop app ships at GA — same workspace, native notifications, hardware-accelerated panels. Mobile apps for iOS and Android arrive in year two."
  },
  {
    q: "How do upgrades, downgrades, and cancellations work?",
    a:
      "Tier changes are prorated and take effect immediately. Cancellations end at the close of your billing cycle — your data stays for 90 days in case you come back. No retention calls, no dark patterns. Manage everything from your account settings."
  }
];

export function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <Reveal className="text-center mb-14">
          <div className="spaced-display text-[10.5px] uppercase tracking-[0.4em] text-falcon-gold mb-5">
            Common questions
          </div>
          <h2
            className="font-display font-medium text-white tracking-[-0.015em] leading-[1.05]"
            style={{ fontSize: "clamp(34px, 5vw, 60px)" }}
          >
            Everything you&apos;d ask before signing up.
          </h2>
        </Reveal>

        <div className="divide-y divide-white/8 border-y border-white/8">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 60}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-start gap-6 py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[17px] sm:text-[19px] font-medium tracking-[-0.01em] group-hover:text-falcon-gold transition-colors">
                      {item.q}
                    </div>
                    <div
                      className={clsx(
                        "overflow-hidden transition-[max-height,opacity,margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        isOpen ? "max-h-[400px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
                      )}
                    >
                      <p className="text-white/85 leading-[1.7] font-light max-w-3xl text-[14.5px] sm:text-[15.5px]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                  <span
                    className={clsx(
                      "shrink-0 mt-1 w-8 h-8 rounded-full border border-white/15 flex items-center justify-center transition-colors",
                      isOpen ? "bg-falcon-gold/15 border-falcon-gold/40 text-falcon-gold" : "text-white/65 group-hover:text-white"
                    )}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
