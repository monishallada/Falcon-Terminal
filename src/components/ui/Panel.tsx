"use client";
import clsx from "clsx";
import { GripVertical, X, Link2, Settings2 } from "lucide-react";
import { ChipColor } from "@/lib/types";
import { GroupDot } from "./GroupDot";
import React from "react";

interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  group?: ChipColor | null;
  onSetGroup?: (c: ChipColor | null) => void;
  onClose?: () => void;
  onConfig?: () => void;
  rightAdornment?: React.ReactNode;
  bodyClassName?: string;
  children: React.ReactNode;
  // when true, header is the drag handle for react-grid-layout
  draggable?: boolean;
}

const COLOR_OPTIONS: (ChipColor | null)[] = ["blue", "yellow", "red", "green", "purple", "cyan", "pink", "gray", null];

export function Panel({
  title,
  subtitle,
  group,
  onSetGroup,
  onClose,
  onConfig,
  rightAdornment,
  bodyClassName,
  draggable = true,
  children
}: Props) {
  const [groupOpen, setGroupOpen] = React.useState(false);
  return (
    <div className="absolute inset-0 flex flex-col bg-bg-1 rounded-md shadow-panel border border-line-soft overflow-hidden hover:border-line">
      <div
        className={clsx(
          "panel-handle h-7 px-2 flex items-center gap-1.5 border-b border-line-soft bg-bg-2/60 select-none",
          draggable && "panel-drag"
        )}
      >
        <GripVertical size={11} className="text-ink-faint shrink-0" />
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="text-[11px] font-semibold tracking-wide uppercase text-ink truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-[10.5px] font-mono text-ink-mute truncate">{subtitle}</div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {rightAdornment}
          {onSetGroup && (
            <div className="relative">
              <button
                className="p-1 rounded hover:bg-bg-3 text-ink-mute hover:text-ink"
                onClick={(e) => {
                  e.stopPropagation();
                  setGroupOpen((v) => !v);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Link panel to a color group"
              >
                {group ? (
                  <span className="flex items-center gap-1">
                    <GroupDot color={group} />
                    <Link2 size={11} />
                  </span>
                ) : (
                  <Link2 size={12} />
                )}
              </button>
              {groupOpen && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 bg-bg-2 border border-line rounded-md p-2 shadow-xl"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] uppercase tracking-wider text-ink-mute mb-1">Link group</div>
                  <div className="flex gap-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={String(c)}
                        title={c ?? "none"}
                        onClick={() => {
                          onSetGroup(c);
                          setGroupOpen(false);
                        }}
                        className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center border",
                          c ? "" : "border-dashed border-ink-faint",
                          group === c ? "ring-2 ring-falcon-amber ring-offset-1 ring-offset-bg-2" : ""
                        )}
                      >
                        {c && <GroupDot color={c} large />}
                        {!c && <span className="text-[10px] text-ink-mute">∅</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {onConfig && (
            <button
              className="p-1 rounded hover:bg-bg-3 text-ink-mute hover:text-ink"
              onClick={(e) => {
                e.stopPropagation();
                onConfig();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Settings"
            >
              <Settings2 size={12} />
            </button>
          )}
          {onClose && (
            <button
              className="p-1 rounded hover:bg-bear/10 text-ink-mute hover:text-bear"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Close"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
      <div className={clsx("flex-1 min-h-0 overflow-hidden", bodyClassName)}>{children}</div>
    </div>
  );
}
