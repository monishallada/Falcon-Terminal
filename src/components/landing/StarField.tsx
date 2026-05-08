"use client";
import { useMemo } from "react";

interface Props {
  density?: number;          // total stars across all 3 layers
  className?: string;
}

// Deterministic seeded RNG so server and client agree (no hydration mismatch).
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

interface Layer {
  depth: 1 | 2 | 3;
  stars: { x: number; y: number; r: number; o: number; tw: number }[];
  duration: number;
  blur: number;
}

/**
 * Multi-layer parallax starfield. Renders 3 SVG layers, each drifting at a
 * different speed, with stars distributed deterministically (so SSR matches
 * the client). Animated via CSS keyframes — no per-frame React state.
 */
export function StarField({ density = 320, className }: Props) {
  const layers = useMemo<Layer[]>(() => {
    const counts = [Math.floor(density * 0.55), Math.floor(density * 0.30), Math.floor(density * 0.15)];
    const durations = [180, 110, 70];
    const blurs = [0, 0.4, 0.8];
    const radii = [
      [0.35, 0.9],   // layer 1 — small, distant
      [0.6, 1.4],    // layer 2 — mid
      [1.0, 2.2]     // layer 3 — close, larger
    ];

    return counts.map((count, i) => {
      const r = rng(0xfa1ce005 + i * 99);
      const stars: Layer["stars"] = [];
      for (let k = 0; k < count; k++) {
        stars.push({
          x: r() * 100,
          y: r() * 200, // double height — we'll wrap with the drift animation
          r: radii[i][0] + r() * (radii[i][1] - radii[i][0]),
          o: 0.45 + r() * 0.55,
          tw: 2 + r() * 5
        });
      }
      return { depth: (i + 1) as 1 | 2 | 3, stars, duration: durations[i], blur: blurs[i] };
    });
  }, [density]);

  return (
    <div className={"absolute inset-0 overflow-hidden " + (className ?? "")} aria-hidden>
      {layers.map((layer, i) => (
        <div
          key={i}
          className="stars-layer"
          style={{
            animation: `starDrift${layer.depth} ${layer.duration}s linear infinite`,
            filter: layer.blur ? `blur(${layer.blur}px)` : undefined
          }}
        >
          <svg
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 100 200"
            style={{ display: "block" }}
          >
            {layer.stars.map((s, idx) => (
              <circle
                key={idx}
                cx={s.x}
                cy={s.y}
                r={s.r * 0.045 /* svg coord units */}
                fill="white"
                opacity={s.o}
                style={{
                  animation: `starTwinkle ${s.tw}s ease-in-out infinite`,
                  animationDelay: `${(idx % 13) * 0.21}s`
                }}
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}
