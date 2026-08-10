import { Avatar } from "@/components/ui/avatar";
import type { LeaderRow } from "@/types";

const HEALTH_COLOR: Record<string, string> = {
  good: "#10b981",
  warn: "#f59e0b",
  bad: "#ef4444",
};

/** Layer 2 — ranked list with an inline magnitude bar. */
export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const max = Math.max(...rows.map((r) => r.metric));
  return (
    <ul className="thin-scrollbar h-full space-y-2 overflow-y-auto">
      {rows.map((r, i) => (
        <li key={r.id} className="flex items-center gap-2">
          <span className="tabular w-4 shrink-0 text-[11px] font-medium text-muted-foreground">
            {i + 1}
          </span>
          <Avatar name={r.name} size={22} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-ink">{r.name}</span>
              <span className="tabular shrink-0 text-[11px] font-semibold text-ink">
                {r.metric}
                <span className="ml-0.5 font-normal text-muted-foreground">{r.unit}</span>
              </span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(r.metric / max) * 100}%`,
                  background: HEALTH_COLOR[r.health],
                }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
