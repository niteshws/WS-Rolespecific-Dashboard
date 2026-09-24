import { cn } from "@/lib/utils";
import type { StatGroupPayload } from "@/types";

const HEALTH_DOT: Record<string, string> = {
  good: "bg-health-good",
  warn: "bg-health-warn",
  bad: "bg-health-bad",
};

/** Layer 1 — a cluster of micro-stats (e.g. Productivity / Activity / Idle / Away). */
export function StatGroup({ payload }: { payload: StatGroupPayload }) {
  const cols = payload.columns ?? payload.stats.length;
  return (
    <div
      className="grid h-full items-center gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {payload.stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "flex flex-col justify-center px-1",
            i > 0 && "border-l border-border pl-3",
          )}
        >
          <div className="flex items-center gap-1.5">
            {s.health && (
              <span className={cn("h-1.5 w-1.5 rounded-full", HEALTH_DOT[s.health])} />
            )}
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {s.label}
            </span>
          </div>
          <div
            className="tabular mt-1 text-xl font-semibold leading-none text-zinc-700 dark:text-zinc-300"
            style={s.accent ? { color: s.accent } : undefined}
          >
            {s.value}
          </div>
          {(s.sub || s.delta) && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
              {s.delta && (
                <span
                  className={cn(
                    "font-medium",
                    s.health === "bad"
                      ? "text-health-bad"
                      : s.health === "good"
                        ? "text-health-good"
                        : "text-muted",
                  )}
                >
                  {s.delta}
                </span>
              )}
              {s.sub && <span className="truncate">{s.sub}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
