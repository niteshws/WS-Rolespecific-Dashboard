import type { ProgressBarsPayload } from "@/types";

/** Layer 2 — labeled progress bars with a right-aligned value (e.g. hrs/day by mode). */
export function ProgressBars({ payload }: { payload: ProgressBarsPayload }) {
  const scale = payload.scale ?? "each";

  return (
    <div className="flex h-full flex-col justify-center gap-4">
      {payload.rows.map((r) => {
        const pct = Math.max(0, Math.min(100, r.percent));
        const width = pct <= 0 ? 0 : Math.max(2, pct);
        return (
          <div key={r.label}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{r.label}</span>
              <span className="tabular text-sm font-semibold text-primary">{r.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${width}%`,
                  background: r.color ?? "#0ea5e9",
                }}
              />
            </div>
            {scale === "each" && (
              <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            )}
          </div>
        );
      })}
      {scale === "shared" && (
        <div className="-mt-1 flex justify-between text-[9px] text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}
