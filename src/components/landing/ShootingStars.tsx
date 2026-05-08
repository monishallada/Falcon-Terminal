"use client";
import { useMemo } from "react";

interface Props {
  count?: number;
  className?: string;
}

/**
 * Periodic shooting-star streaks using pure CSS keyframe animations. Each
 * streak is a small div with a 1px-wide gradient tail that translates across
 * the viewport diagonally, fades in/out, and loops on a long, randomly-
 * staggered delay so they appear sporadically rather than in a march. The
 * streak heads are tinted slightly warm to read as "stardust" rather than
 * sterile white.
 */
export function ShootingStars({ count = 9, className }: Props) {
  const streaks = useMemo(() => {
    // Deterministic seeded RNG so SSR matches client (no hydration mismatch)
    let s = 0xfa1c0857;
    const rnd = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: count }).map((_, i) => {
      // Start position somewhere in the upper-left third of the screen
      const top = rnd() * 60; // %
      const left = rnd() * 60; // %
      // Distance to travel as a viewport fraction
      const distance = 60 + rnd() * 40;
      // Diagonal angle (down-right is the classic shooting-star direction)
      const angle = 18 + rnd() * 14; // degrees
      // Travel time + gap between repeats
      const duration = 1.8 + rnd() * 1.6; // seconds for one streak
      const delay = i * 5 + rnd() * 12; // staggered initial start
      const cycle = 14 + rnd() * 18; // seconds between streaks
      return { top, left, distance, angle, duration, delay, cycle, key: i };
    });
  }, [count]);

  return (
    <div
      className={"absolute inset-0 overflow-hidden pointer-events-none " + (className ?? "")}
      aria-hidden
    >
      {streaks.map((s) => (
        <span
          key={s.key}
          className="shooting-star"
          style={
            {
              top: `${s.top}%`,
              left: `${s.left}%`,
              ["--ss-distance" as string]: `${s.distance}vw`,
              ["--ss-angle" as string]: `${s.angle}deg`,
              ["--ss-duration" as string]: `${s.duration}s`,
              ["--ss-cycle" as string]: `${s.cycle}s`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.cycle}s`
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
