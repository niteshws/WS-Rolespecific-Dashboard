import { useState } from "react";
import type { StackedDatum } from "@/types";

/** Layer 2 — horizontal stacked bars for activity-type allocation. */
export function StackedBar({
  data,
  highlightLabel,
}: {
  data: StackedDatum[];
  highlightLabel?: string | null;
}) {
  const [hover, setHover] = useState<{ label: string; key: string; value: number } | null>(
    null,
  );
  const max = Math.max(...data.map((d) => d.segments.reduce((s, x) => s + x.value, 0)));
  const keys = data[0]?.segments.map((s) => ({ key: s.key, color: s.color })) ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
        {data.map((row) => {
          const total = row.segments.reduce((s, x) => s + x.value, 0);
          const dim = highlightLabel ? row.label !== highlightLabel : false;
          return (
            <div key={row.label} className="group" style={{ opacity: dim ? 0.4 : 1 }}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-ink">{row.label}</span>
                <span className="tabular text-[11px] text-muted-foreground">{total}h</span>
              </div>
              <div className="flex h-5 w-full overflow-hidden rounded bg-muted/5">
                {row.segments.map((seg) => (
                  <div
                    key={seg.key}
                    className="h-full cursor-pointer transition-all first:rounded-l last:rounded-r hover:brightness-110"
                    style={{ width: `${(seg.value / max) * 100}%`, background: seg.color }}
                    onMouseEnter={() =>
                      setHover({ label: row.label, key: seg.key, value: seg.value })
                    }
                    onMouseLeave={() => setHover(null)}
                    role="img"
                    aria-label={`${row.label} ${seg.key}: ${seg.value} hours`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {keys.map((k) => (
          <span key={k.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-sm" style={{ background: k.color }} />
            {k.key}
          </span>
        ))}
        {hover && (
          <span className="ml-auto rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">
            {hover.label} · {hover.key}: {hover.value}h
          </span>
        )}
      </div>
    </div>
  );
}
