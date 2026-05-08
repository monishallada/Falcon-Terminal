import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Falcon dark palette — terminal black with electric amber accents
        bg: {
          0: "#06080c",
          1: "#0b0f16",
          2: "#10151f",
          3: "#161c28",
          4: "#1d2531"
        },
        line: { DEFAULT: "#1f2937", soft: "#161c28", strong: "#2a3344" },
        ink: {
          DEFAULT: "#e5e9f0",
          dim: "#9aa3b2",
          mute: "#6b7280",
          faint: "#4b5364"
        },
        falcon: {
          amber: "#ffb020",
          gold: "#f0a500",
          orange: "#ff7a1a",
          ember: "#ff5722"
        },
        bull: { DEFAULT: "#16c784", soft: "#0e3a2a", glow: "#22d39a" },
        bear: { DEFAULT: "#ea3943", soft: "#3a1217", glow: "#ff5562" },
        link: { DEFAULT: "#3a82f6", purple: "#a855f7", cyan: "#22d3ee" },
        chip: {
          blue: "#3b82f6",
          yellow: "#eab308",
          red: "#ef4444",
          green: "#22c55e",
          purple: "#a855f7",
          cyan: "#06b6d4",
          pink: "#ec4899",
          gray: "#64748b"
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        "2xs": ["10px", "12px"],
        xxs: ["11px", "14px"]
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.02) inset, 0 0 0 1px rgba(255,255,255,0.04)",
        "panel-hover": "0 0 0 1px rgba(255,176,32,0.3), 0 8px 30px rgba(255,176,32,0.05)",
        glow: "0 0 24px rgba(255,176,32,0.18)"
      },
      animation: {
        "pulse-slow": "pulse 2.5s ease-in-out infinite",
        "tape-scroll": "tape 60s linear infinite",
        flash: "flash 700ms ease-out"
      },
      keyframes: {
        tape: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        },
        flash: {
          "0%": { backgroundColor: "rgba(255,176,32,0.4)" },
          "100%": { backgroundColor: "transparent" }
        }
      }
    }
  },
  plugins: []
};

export default config;
