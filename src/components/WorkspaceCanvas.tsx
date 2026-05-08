"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { renderWidget } from "./widgets";

// react-grid-layout is a client-only library — load via dynamic import to avoid SSR issues.
const GridLayout = dynamic(() => import("react-grid-layout"), { ssr: false });

const COLS = 24;
const ROW_HEIGHT = 22;

export function WorkspaceCanvas() {
  const ws = useWorkspace((s) => s.active());
  const setLayout = useWorkspace((s) => s.setLayout);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => ws.layout.map((l) => ({ ...l, minW: l.minW ?? 4, minH: l.minH ?? 5 })), [ws.layout]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-auto bg-bg-0 bg-dotgrid">
      {width > 0 && (
        <GridLayout
          className="layout"
          width={width}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          margin={[6, 6]}
          containerPadding={[8, 8]}
          layout={layout}
          draggableHandle=".panel-drag"
          compactType={null}
          preventCollision={false}
          allowOverlap={false}
          onLayoutChange={(next) => {
            // Only persist if topology changed
            const same =
              next.length === layout.length &&
              next.every((n, i) => layout[i] && n.i === layout[i].i && n.x === layout[i].x && n.y === layout[i].y && n.w === layout[i].w && n.h === layout[i].h);
            if (!same) {
              setLayout(next.map((n) => ({ i: n.i, x: n.x, y: n.y, w: n.w, h: n.h, minW: n.minW, minH: n.minH })));
            }
          }}
          resizeHandles={["se"]}
        >
          {ws.layout.map((l) => {
            const panel = ws.panels[l.i];
            if (!panel) return <div key={l.i} />;
            return (
              <div key={l.i} className="relative">
                {renderWidget(panel.type, panel.i)}
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}
