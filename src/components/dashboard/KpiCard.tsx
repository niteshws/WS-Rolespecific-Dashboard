import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/utils";
import type { KpiSpec } from "@/types";
import { Icon } from "@/components/Icon";

const HEALTH_DOT: Record<string, string> = {
  good: "bg-health-good",
  warn: "bg-health-warn",
  bad: "bg-health-bad",
};

/**
 * Layer 1 — "The Glance". A macro KPI with a comparative benchmark and a
 * sparkline. Clicking it drills straight through to its Layer-3 report drawer.
 */
export function KpiCard({
  spec,
  onOpenReport,
}: {
  spec: KpiSpec;
  onOpenReport: (reportKey?: string) => void;
}) {
  const isBadDirection = spec.deltaPolarity === "up-bad" ? spec.delta > 0 : spec.delta < 0;
  const deltaColor =
    spec.deltaPolarity === "neutral" ? "text-muted" : isBadDirection ? "text-health-bad" : "text-health-good";
  const DeltaIcon = spec.delta >= 0 ? ArrowUpRight : ArrowDownRight;
  const sparkColor =
    spec.deltaPolarity === "neutral" ? "#0ea5e9" : isBadDirection ? "#ef4444" : "#10b981";

  return (
    <button
      type="button"
      onClick={() => spec.state !== "coming-soon" && onOpenReport(spec.reportKey)}
      aria-label={`${spec.label}: ${spec.value}, ${spec.deltaLabel}. Open detailed report.`}
      className={cn("group text-left focus-visible:outline-none", spec.state === "coming-soon" && "cursor-default")}
    >
      <Card className="relative h-full overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card-hover">
        <span
          className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
              <Icon name={spec.icon} className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-medium text-muted">{spec.label}</span>
          </div>
          {spec.state === "coming-soon" ? (
             <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground" aria-label="Coming Soon">
               Coming Soon
             </span>
          ) : (
             <span
               className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", HEALTH_DOT[spec.health])}
               aria-label={`health: ${spec.health}`}
             />
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="tabular text-2xl font-semibold leading-none text-ink">{spec.value}</div>
            <div className={cn("mt-2 flex items-center gap-0.5 text-xs font-medium", deltaColor)}>
              <DeltaIcon className="h-3.5 w-3.5" />
              <span className="tabular">{spec.deltaLabel}</span>
            </div>
          </div>
          <div className="opacity-90">
            <Sparkline data={spec.sparkline} color={sparkColor} />
          </div>
        </div>

        {!spec.state || spec.state !== "coming-soon" ? (
          <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View detailed report
            <ArrowUpRight className="h-3 w-3" />
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-transparent">
            &nbsp;
          </div>
        )}
      </Card>
    </button>
  );
}
