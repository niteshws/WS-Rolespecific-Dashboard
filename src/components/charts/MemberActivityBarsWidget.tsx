import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import type { MemberActivityBarsPayload } from "@/types";

function barColor(activity: number, max: number): string {
  const rel = activity / max;
  if (rel >= 0.85) return "#047857";
  if (rel >= 0.7) return "#059669";
  return "#f59e0b";
}

/** Layer 2 — avatar + name + activity bar + %; bar hover shows activity & idle. */
export function MemberActivityBarsWidget({ payload }: { payload: MemberActivityBarsPayload }) {
  const max = Math.max(...payload.rows.map((r) => r.activity), 1);

  return (
    <ul className="thin-scrollbar flex h-full min-h-0 flex-col justify-center gap-3.5 overflow-y-auto">
      {payload.rows.map((row) => {
        const widthPct = Math.max(8, (row.activity / max) * 100);
        const color = barColor(row.activity, max);
        return (
          <li key={row.name} className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)_2.75rem] items-center gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar name={row.name} size={26} className="rounded-full" />
              <span className="truncate text-[12px] font-medium text-zinc-700 dark:text-zinc-300" title={row.name}>
                {row.name}
              </span>
            </span>

            <Tooltip
              wrapperClassName="block w-full min-w-0"
              className="whitespace-normal"
              content={
                <span className="flex flex-col gap-0.5 text-left font-normal leading-snug">
                  <span>Activity {row.activity}%</span>
                  <span>Idle {row.idle}%</span>
                </span>
              }
            >
              <span className="block w-full cursor-default py-1" tabIndex={0}>
                <span className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#e8eaed]">
                  <span
                    className="block h-full rounded-full transition-all"
                    style={{ width: `${widthPct}%`, background: color }}
                  />
                </span>
              </span>
            </Tooltip>

            <span className="tabular text-right text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">{row.activity}%</span>
          </li>
        );
      })}
    </ul>
  );
}
