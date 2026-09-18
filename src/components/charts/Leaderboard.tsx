import { TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { LeaderRow, TopContributorsPayload } from "@/types";

/** Layer 2 — ranked contributors with hours, share %, and insight footer. */
export function Leaderboard({
  payload,
}: {
  payload: TopContributorsPayload | LeaderRow[];
}) {
  const isLegacy = Array.isArray(payload);
  const rows = isLegacy ? payload : payload.rows;
  const insight = isLegacy ? null : payload.insight;
  const max = Math.max(...rows.map((r) => r.metric), 1);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <ul className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {rows.map((r, i) => {
          const barColor = i < 2 ? "#10b981" : "#0ea5e9";
          const hoursText = r.hoursLabel ?? `${r.metric}${r.unit ? r.unit : ""}`;
          const pct =
            r.percent ??
            Math.round((r.metric / rows.reduce((s, x) => s + x.metric, 0)) * 100);
          return (
            <li key={r.id} className="flex items-start gap-2.5">
              <Avatar name={r.name} size={28} className="mt-0.5 rounded-full" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-ink">{r.name}</span>
                <div className="mt-0.5 flex gap-2">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(4, (r.metric / max) * 100)}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                  <span className="tabular shrink-0 text-[11px] font-bold text-ink">{hoursText}</span>
                  <span className="inline-flex min-w-[2.25rem] shrink-0 items-center justify-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tabular text-slate-600">
                    {pct}%
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {insight && (
        <div className="flex shrink-0 items-start gap-2 rounded-xl bg-sky-50/90 px-3 py-2.5">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-600">{insight}</p>
        </div>
      )}
    </div>
  );
}
