import { Badge } from "@/components/ui/badge";
import type { AppRow } from "@/types";

const CAT_VARIANT: Record<AppRow["category"], "good" | "neutral" | "bad"> = {
  Productive: "good",
  Neutral: "neutral",
  Distracting: "bad",
};

/** Layer 2 — application footprint with policy categorization. */
export function AppBreakdown({ rows }: { rows: AppRow[] }) {
  const max = Math.max(...rows.map((r) => r.hours));
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r) => (
        <div key={r.app} className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
            style={{ background: r.color }}
            aria-hidden="true"
          >
            {r.app.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="truncate text-sm font-medium text-ink">{r.app}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="tabular text-xs text-muted-foreground">{r.hours}h</span>
                <Badge variant={CAT_VARIANT[r.category]} className="h-5 px-1.5 min-w-[20px] justify-center">
                  {r.category[0]}
                </Badge>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${(r.hours / max) * 100}%`, background: r.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
