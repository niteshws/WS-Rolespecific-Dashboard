import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sparkline } from "@/components/charts/Sparkline";
import { getKpiHelp } from "@/data/helpText";
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
  const hasSecondary = Boolean(spec.secondaryValue);
  const isBadDirection = spec.deltaPolarity === "up-bad" ? spec.delta > 0 : spec.delta < 0;
  const deltaColor =
    spec.deltaPolarity === "neutral" ? "text-muted" : isBadDirection ? "text-health-bad" : "text-health-good";
  const DeltaIcon = spec.delta >= 0 ? ArrowUpRight : ArrowDownRight;
  const sparkColor =
    spec.deltaPolarity === "neutral" || hasSecondary
      ? "#6366f1"
      : isBadDirection
        ? "#ef4444"
        : "#10b981";

  const ariaDetail = hasSecondary
    ? `${spec.secondaryValue} ${spec.secondaryLabel ?? ""}`.trim()
    : spec.deltaLabel;
  const isComingSoon = spec.state === "coming-soon";
  const info = spec.info ?? getKpiHelp(spec.id, spec.label);

  return (
    <button
      type="button"
      onClick={() => !isComingSoon && onOpenReport(spec.reportKey)}
      aria-label={
        isComingSoon
          ? `${spec.label}: Coming Soon`
          : `${spec.label}: ${spec.value}, ${ariaDetail}. Open detailed report.`
      }
      className={cn("group text-left focus-visible:outline-none", isComingSoon && "cursor-default")}
      disabled={isComingSoon}
    >
      <Card
        className={cn(
          "relative h-full overflow-visible p-4 transition-all duration-200",
          !isComingSoon && "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card-hover",
        )}
      >
        {isComingSoon && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-4 text-center">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <h4 className="mt-2 text-xs font-bold text-foreground">Coming Soon</h4>
            <p className="mt-1 max-w-[160px] text-[10px] leading-tight text-muted-foreground">
              This metric will be available in a future update.
            </p>
          </div>
        )}

        <span
          className="absolute inset-y-0 left-0 w-1 rounded-l-lg bg-primary opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-2" aria-hidden={isComingSoon}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
              <Icon name={spec.icon} className="h-3.5 w-3.5" />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight text-ink">
              {spec.label}
            </span>
            {info && <InfoTip content={info} side="top" />}
          </div>
          <span
            className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", HEALTH_DOT[spec.health])}
            aria-label={`health: ${spec.health}`}
          />
        </div>

        <div className="mt-3.5 flex items-end justify-between gap-3" aria-hidden={isComingSoon}>
          <div className="min-w-0">
            <div className="tabular text-[1.75rem] font-semibold leading-none tracking-tight text-zinc-700 dark:text-zinc-300">
              {spec.value}
            </div>

            {hasSecondary ? (
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="tabular text-sm font-semibold leading-none text-zinc-700 dark:text-zinc-300">
                  {spec.secondaryValue}
                </span>
                <span className="text-[11px] font-medium leading-none text-muted">
                  {spec.secondaryLabel}
                </span>
              </div>
            ) : (
              <div className={cn("mt-2.5 flex items-center gap-0.5 text-xs font-medium", deltaColor)}>
                {spec.delta !== 0 && <DeltaIcon className="h-3.5 w-3.5" />}
                <span className="tabular">{spec.deltaLabel}</span>
              </div>
            )}
          </div>
          <div className="mb-0.5 shrink-0 opacity-90">
            <Sparkline data={spec.sparkline} color={sparkColor} />
          </div>
        </div>

        <div
          className={cn(
            "mt-3 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity",
            !isComingSoon && "group-hover:opacity-100",
          )}
          aria-hidden={isComingSoon}
        >
          View detailed report
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </Card>
    </button>
  );
}
