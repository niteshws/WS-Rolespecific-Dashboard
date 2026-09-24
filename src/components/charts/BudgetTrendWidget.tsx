import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { AxisChart } from "@/components/charts/AxisChart";
import { cn } from "@/lib/utils";
import type { BudgetTrendPayload, BudgetTrendPeriod } from "@/types";

const PERIODS: BudgetTrendPeriod[] = ["Weekly", "Monthly", "Quarterly", "Yearly"];

/** Period control for Budget Trend (header, beside View all). */
export function BudgetTrendPeriodBadge({
  period,
  onChange,
}: {
  period: BudgetTrendPeriod;
  onChange: (period: BudgetTrendPeriod) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent): void => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-muted/10"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select budget period"
      >
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        {period}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-20 mt-1 min-w-[8.5rem] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {PERIODS.map((p) => (
            <li key={p}>
              <button
                type="button"
                role="option"
                aria-selected={p === period}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted/10",
                  p === period ? "font-semibold text-primary" : "text-zinc-700 dark:text-zinc-300",
                )}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Layer 2 — budget allocated / billing / burn chart for the selected period. */
export function BudgetTrendWidget({
  payload,
  period,
}: {
  payload: BudgetTrendPayload;
  period: BudgetTrendPeriod;
}) {
  const chart = payload.periods[period];
  const isWeekly = period === "Weekly";
  const isMonthly = period === "Monthly";

  return (
    <div
      className={cn(
        "h-full min-h-0",
        (isWeekly || isMonthly) && "thin-scrollbar overflow-x-auto",
      )}
    >
      <div
        className="h-full"
        style={
          isWeekly
            ? { minWidth: `${Math.max(560, chart.xLabels.length * 42)}px` }
            : isMonthly
              ? { minWidth: `${Math.max(480, chart.xLabels.length * 56)}px` }
              : undefined
        }
      >
        <AxisChart payload={chart} />
      </div>
    </div>
  );
}
