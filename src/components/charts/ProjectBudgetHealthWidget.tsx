import { ArrowRight, BarChart3 } from "lucide-react";
import type { ProjectBudgetHealthPayload } from "@/types";

/**
 * Layer 2 — Project Budget Health (reference layout).
 * Donut + utilization summary, status band cards, and overrun insight.
 */
export function ProjectBudgetHealthWidget({
  payload,
  onViewAffected,
}: {
  payload: ProjectBudgetHealthPayload;
  onViewAffected?: () => void;
}) {
  const { slices, healthPercent, healthLabel, healthStatus, utilization, bands, insight } =
    payload;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 38;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 sm:flex-row sm:items-center">
        {/* Donut */}
        <div className="relative mx-auto h-[148px] w-[148px] shrink-0 sm:mx-0">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label="Budget health score"
          >
            <circle cx="50" cy="50" r={R} fill="none" stroke="#E5E7EB" strokeWidth="9" />
            {slices.map((s) => {
              const frac = s.value / total;
              const dash = frac * C;
              const el = (
                <circle
                  key={s.key}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="9"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                >
                  <title>{`${s.key}: ${s.value}%`}</title>
                </circle>
              );
              offset += dash;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
            <span className="tabular text-2xl font-bold leading-none text-ink">{healthPercent}%</span>
            <span className="mt-1 text-[10px] leading-tight text-muted-foreground">{healthLabel}</span>
            <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {healthStatus}
            </span>
          </div>
        </div>

        {/* Utilization */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">Budget Utilization</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="tabular text-xl font-bold leading-none text-ink sm:text-2xl">
              {utilization.spentShort}
              <span className="text-muted-foreground"> / {utilization.budgetShort}</span>
            </p>
            <span className="tabular text-sm font-semibold text-emerald-600">{utilization.percent}%</span>
          </div>
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted/15">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, utilization.percent)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{utilization.detail}</p>
        </div>
      </div>

      {/* Status bands */}
      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
        {bands.map((b) => (
          <div key={b.key} className="rounded-xl px-2 py-2.5" style={{ background: b.bg }}>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: b.color }} />
              <span className="tabular text-sm font-bold" style={{ color: b.color }}>
                {b.percentLabel}
              </span>
            </div>
            <p className="mt-1 truncate text-[11px] font-semibold text-ink">{b.key}</p>
            <p className="text-[10px] text-muted-foreground">{b.projects} projects</p>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div className="flex shrink-0 items-start gap-2 rounded-xl bg-[#F5F3FF] px-3 py-2.5">
        <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold leading-snug text-ink">{insight.title}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{insight.body}</p>
        </div>
        {onViewAffected && (
          <button
            type="button"
            onClick={onViewAffected}
            className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View affected projects
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
