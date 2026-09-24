import { BarChart3, Lightbulb } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import type { ProjectsWorkedPayload } from "@/types";

/** Layer 2 — project status bars with a side insight callout. */
export function ProjectsWorkedWidget({ payload }: { payload: ProjectsWorkedPayload }) {
  const total = Math.max(
    payload.statuses.reduce((sum, s) => sum + s.value, 0),
    1,
  );
  const top = payload.statuses.reduce((best, s) => (s.value > best.value ? s : best), payload.statuses[0]);
  const topPct = Math.round((top.value / total) * 100);

  return (
    <div className="flex h-full min-h-0 items-stretch gap-4">
      <ul className="flex min-w-0 flex-[1.4] flex-col justify-center gap-2.5">
        {payload.statuses.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <li key={s.key} className="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-3">
              <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">{s.key}</span>
              <Tooltip
                side="top"
                wrapperClassName="block w-full min-w-0"
                content={`${pct}% · ${s.value} projects`}
              >
                <div className="h-2.5 w-full cursor-default overflow-hidden rounded-full bg-muted/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(pct > 0 ? 4 : 0, Math.min(100, pct))}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </Tooltip>
              <span className="tabular shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300">{s.value}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex w-[38%] min-w-[168px] max-w-[220px] shrink-0 flex-col justify-center gap-4 rounded-xl bg-primary/[0.04] px-4 py-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs leading-snug text-zinc-700 dark:text-zinc-300">
            <span className="text-base font-bold tabular">{topPct}%</span>
            {" "}of projects are in <span className="font-semibold">{top.key}</span> stage.
          </p>
        </div>
        <div className="h-px w-full bg-border/70" aria-hidden="true" />
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-primary">
            <Lightbulb className="h-4 w-4" />
          </span>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {payload.insight.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
