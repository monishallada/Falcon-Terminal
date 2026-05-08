"use client";
import clsx from "clsx";
import { ChipColor } from "@/lib/types";

const MAP: Record<ChipColor, string> = {
  blue: "bg-chip-blue",
  yellow: "bg-chip-yellow",
  red: "bg-chip-red",
  green: "bg-chip-green",
  purple: "bg-chip-purple",
  cyan: "bg-chip-cyan",
  pink: "bg-chip-pink",
  gray: "bg-chip-gray"
};

export function GroupDot({ color, large = false }: { color: ChipColor; large?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full",
        MAP[color],
        large ? "w-3 h-3" : "w-2 h-2"
      )}
    />
  );
}
