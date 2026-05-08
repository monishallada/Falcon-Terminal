"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface Props {
  children: React.ReactNode;
  delay?: number;       // ms — staggered entrance
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  /** Begin slightly before the element enters the viewport. Default 12% */
  threshold?: number;
}

/**
 * Wraps children in an element that fades + translates up when it scrolls
 * into view. IntersectionObserver based, fires once per element. Cooperates
 * with `prefers-reduced-motion`.
 */
export function Reveal({ children, delay = 0, className, as = "div", threshold = 0.12 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      className={clsx(shown ? "reveal-in" : "reveal-init", className)}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
