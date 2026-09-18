import { TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { projectStatusPill } from "@/lib/status";
import type { UpcomingLeavesPayload } from "@/types";

/** Layer 2 — upcoming / active leave roster (matches Top Contributors list chrome). */
export function UpcomingLeavesWidget({ payload }: { payload: UpcomingLeavesPayload }) {
  const preview = payload.rows.slice(0, 5);
  const insight =
    payload.insight ??
    `${payload.totalOnLeave} members on leave — ${payload.rows.filter((r) => r.returnLabel === "Today").length} returning today.`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <ul className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {preview.map((row) => {
          const pill = projectStatusPill(row.leaveType);
          return (
            <li key={row.id} className="flex items-center gap-2.5">
              <Avatar name={row.name} size={28} className="shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-ink">{row.name}</span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {row.department}
                </span>
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
                  !pill && "bg-slate-100 text-slate-600",
                )}
                style={pill ? { color: pill.text, background: pill.bg } : undefined}
              >
                {row.leaveType}
              </span>
              <span className="w-[3.75rem] shrink-0 text-right text-[11px] font-medium tabular text-muted-foreground">
                {row.returnLabel}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex shrink-0 items-start gap-2 rounded-xl bg-sky-50/90 px-3 py-2.5">
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-600">{insight}</p>
      </div>
    </div>
  );
}
