"use client";
import clsx from "clsx";

interface Props {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  variant?: "gold" | "white";
  className?: string;
  trailingDot?: boolean;
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  xs:   "text-[12px] tracking-[0.5em]",
  sm:   "text-[15px] tracking-[0.5em]",
  md:   "text-[22px] tracking-[0.45em]",
  lg:   "text-[40px] tracking-[0.32em]",
  xl:   "text-[78px] tracking-[0.28em]",
  hero: "text-[clamp(64px,12vw,168px)] tracking-[0.24em]"
};

/**
 * The FALCON wordmark — thin, geometric, airy, intergalactic. Matches the
 * brand identity exactly: light-weight letters with wide tracking, gold on
 * black. Uses the brand display font ("Outfit" via the layout font loader)
 * with extralight weight and increased letter-spacing.
 */
export function Logo({ size = "md", variant = "gold", className, trailingDot }: Props) {
  return (
    <span
      className={clsx(
        "font-display font-extralight uppercase select-none leading-none",
        SIZE[size],
        variant === "gold" ? "text-falcon-gold" : "text-white",
        className
      )}
      style={{ letterSpacing: undefined /* Tailwind tracking already set above */ }}
    >
      FALCON
      {trailingDot && (
        <span
          className={clsx(
            "ml-3 inline-block align-middle rounded-full",
            variant === "gold" ? "bg-falcon-gold" : "bg-white"
          )}
          style={{ width: "0.18em", height: "0.18em", boxShadow: "0 0 14px currentColor" }}
        />
      )}
    </span>
  );
}
