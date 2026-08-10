import type { ProgressBarsPayload } from "@/types";

/** Layer 2 — labeled progress bars with a right-aligned value (e.g. hrs/day by mode). */
export function ProgressBars({ payload }: { payload: ProgressBarsPayload }) {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      {payload.rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-xs font-medium text-ink">{r.label}</span>
            <span className="tabular text-sm font-semibold text-primary">{r.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(2, Math.min(100, r.percent))}%`, background: r.color ?? "#0ea5e9" }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
