"use client";
import { StarField } from "./StarField";
import { ShootingStars } from "./ShootingStars";

/**
 * Full-page cosmic backdrop. Fixed-positioned behind everything else on the
 * landing route, so the starfield, nebulae, and shooting stars are visible
 * across every section as the user scrolls — Falcon's "operating in space"
 * brand language carried beyond the hero.
 *
 * Layered (back → front):
 *   1. Pure black canvas
 *   2. Distant star layers (parallax drift)
 *   3. Two soft nebula gas clouds — one warm gold (brand) and one cool indigo
 *   4. Shooting stars (sporadic streaks)
 *   5. Subtle grain (mix-blend screen)
 */
export function CosmicBackdrop() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black"
      aria-hidden
    >
      {/* Vertical fade so the very top reads slightly darker (deep space) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(15, 22, 50, 0.55) 0%, rgba(0, 0, 0, 0) 60%)"
        }}
      />

      {/* Nebula clouds — soft, slow, breathing */}
      <div
        className="nebula nebula-anim"
        style={{
          top: "8vh",
          left: "-12vw",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 200, 90, 0.18) 0%, rgba(255, 160, 60, 0.06) 35%, rgba(0,0,0,0) 70%)"
        }}
      />
      <div
        className="nebula nebula-anim"
        style={{
          top: "60vh",
          right: "-18vw",
          width: "70vw",
          height: "70vw",
          animationDelay: "-8s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(120, 90, 220, 0.18) 0%, rgba(80, 110, 220, 0.07) 35%, rgba(0,0,0,0) 70%)"
        }}
      />
      <div
        className="nebula nebula-anim"
        style={{
          top: "150vh",
          left: "30vw",
          width: "55vw",
          height: "55vw",
          animationDelay: "-14s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(70, 200, 230, 0.14) 0%, rgba(50, 130, 220, 0.06) 35%, rgba(0,0,0,0) 70%)"
        }}
      />
      <div
        className="nebula nebula-anim"
        style={{
          top: "230vh",
          right: "10vw",
          width: "45vw",
          height: "45vw",
          animationDelay: "-20s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(240, 193, 75, 0.15) 0%, rgba(255, 120, 60, 0.06) 35%, rgba(0,0,0,0) 70%)"
        }}
      />

      {/* Stars — three drift layers covering the full backdrop */}
      <StarField density={520} />

      {/* Shooting streaks — sporadic, only triggers a couple per minute */}
      <ShootingStars count={10} />

      {/* Subtle grain on top (so monochromatic gradients don't band on cheap displays) */}
      <div className="cosmic-grain" />
    </div>
  );
}
