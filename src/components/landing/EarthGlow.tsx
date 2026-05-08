"use client";

/**
 * The Earth-rim from the brand banner — a dark blue planet curve at the
 * bottom edge of the hero, with a soft atmospheric glow above it. CSS only.
 */
export function EarthGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Atmospheric haze above the limb */}
      <div className="earth-glow" />
      {/* The planet itself — a giant circle that crops at the bottom of the viewport */}
      <div className="earth-rim" />
    </div>
  );
}
