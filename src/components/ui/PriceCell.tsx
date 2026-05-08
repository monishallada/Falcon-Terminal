"use client";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  format: (n: number) => string;
  className?: string;
}

export function PriceCell({ value, format, className }: Props) {
  const prev = useRef(value);
  const [flash, setFlash] = useState<"" | "up" | "down">("");
  useEffect(() => {
    if (value > prev.current) setFlash("up");
    else if (value < prev.current) setFlash("down");
    prev.current = value;
    const t = setTimeout(() => setFlash(""), 600);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <span
      className={clsx(
        "font-mono tabular-nums px-1 rounded",
        flash === "up" && "flash-up",
        flash === "down" && "flash-down",
        className
      )}
    >
      {format(value)}
    </span>
  );
}
