import { useState } from "react";
import type { HeatCell } from "@/types";

/** Layer 2 — day × hour activity heatmap using a purple intensity ramp. */
export function Heatmap({ cells }: { cells: HeatCell[] }) {
  const [hover, setHover] = useState<HeatCell | null>(null);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = Array.from(new Set(cells.map((c) => c.hour))).sort((a, b) => a - b);

  const color = (v: number) => {
    // 0..100 -> tint of #0ea5e9
    const t = v / 100;
    const alpha = 0.06 + t * 0.94;
    return `rgba(14, 165, 233, ${alpha.toFixed(3)})`;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        <div className="flex gap-1">
          {/* day labels column */}
          <div className="flex flex-col justify-around pr-1 pt-4">
            {days.map((d) => (
              <span key={d} className="h-6 text-[10px] leading-6 text-muted-foreground">
                {d}
              </span>
            ))}
          </div>
          {/* grid */}
          <div className="flex-1">
            <div className="flex justify-between px-0.5 pb-1">
              {hours
                .filter((_, i) => i % 2 === 0)
                .map((h) => (
                  <span key={h} className="text-[9px] text-muted-foreground">
                    {h}:00
                  </span>
                ))}
            </div>
            <div className="flex flex-col gap-1">
              {days.map((d) => (
                <div key={d} className="flex gap-1">
                  {hours.map((h) => {
                    const cell = cells.find((c) => c.day === d && c.hour === h)!;
                    return (
                      <div
                        key={`${d}-${h}`}
                        className="h-6 flex-1 cursor-pointer rounded-sm transition-transform hover:scale-110 hover:ring-1 hover:ring-primary"
                        style={{ background: color(cell.value) }}
                        onMouseEnter={() => setHover(cell)}
                        onMouseLeave={() => setHover(null)}
                        role="img"
                        aria-label={`${d} ${h}:00 — ${cell.value}% activity`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {hover && (
          <div className="absolute right-0 top-0 rounded bg-ink px-2 py-1 text-[11px] text-white shadow-pop">
            {hover.day} {hover.hour}:00 —{" "}
            <span className="font-semibold">{hover.value}%</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Low</span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-sm">
          {[10, 30, 50, 70, 90].map((v) => (
            <div key={v} className="flex-1" style={{ background: color(v) }} />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
