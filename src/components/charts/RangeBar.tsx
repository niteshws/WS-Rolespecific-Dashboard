import type { RangeBarPayload } from "@/types";

/** Layer 2 — horizontal range bars over a time axis (e.g. start/end of day). */
export function RangeBar({ payload }: { payload: RangeBarPayload }) {
  const a0 = payload.axisStart ?? 0;
  const a1 = payload.axisEnd ?? 24;
  const span = a1 - a0 || 24;
  const ticks = Array.from({ length: 7 }, (_, i) => a0 + (span / 6) * i);
  const fmtHr = (h: number) => {
    const hr = Math.round(h) % 24;
    const ampm = hr < 12 ? "am" : "pm";
    const h12 = hr % 12 === 0 ? 12 : hr % 12;
    return `${h12}${ampm}`;
  };

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      {payload.rows.map((r) => {
        const left = ((r.start - a0) / span) * 100;
        const width = ((r.end - r.start) / span) * 100;
        return (
          <div key={r.label} className="grid grid-cols-[70px_1fr] items-center gap-3">
            <span className="truncate text-xs font-medium text-ink">{r.label}</span>
            <div className="relative h-6">
              {ticks.map((t, i) => (
                <span
                  key={i}
                  className="absolute top-0 h-full border-l border-border/50"
                  style={{ left: `${(i / 6) * 100}%` }}
                />
              ))}
              <div
                className="absolute top-1 h-4 rounded"
                style={{ left: `${left}%`, width: `${Math.max(2, width)}%`, background: r.color ?? "#0ea5e9" }}
                title={`${fmtHr(r.start)} – ${fmtHr(r.end)}`}
              />
            </div>
          </div>
        );
      })}
      <div className="grid grid-cols-[70px_1fr] gap-3">
        <span />
        <div className="flex justify-between">
          {ticks.map((t, i) => (
            <span key={i} className="text-[9px] text-muted-foreground">
              {fmtHr(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
