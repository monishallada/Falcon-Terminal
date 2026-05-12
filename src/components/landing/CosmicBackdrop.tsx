"use client";

/**
 * Lightweight static backdrop for the landing page. Replaces the prior
 * animated starfield + breathing nebulae, which caused noticeable scroll
 * jank on lower-end machines. We keep a faint amber/blue wash + a fixed
 * grid so the page still reads "terminal" without burning frames.
 */
export function CosmicBackdrop() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#06080d]"
      aria-hidden
    >
      {/* Static color wash — amber top-left, deep blue bottom-right */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 12% 0%, rgba(240, 193, 75, 0.10), rgba(0,0,0,0) 55%)",
            "radial-gradient(ellipse 70% 55% at 90% 100%, rgba(40, 90, 180, 0.14), rgba(0,0,0,0) 60%)"
          ].join(", ")
        }}
      />
      {/* Faint terminal grid */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px"
        }}
      />
      {/* Top + bottom vignette so content reads clean */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.6) 100%)"
        }}
      />
    </div>
  );
}
