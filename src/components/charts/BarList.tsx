import { TrendingUp } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { BarListPayload } from "@/types";

const formatBarValue = (value: number, unit?: string): string => {
  if (unit === "%") return `${value}%`;
  if (unit === "₹M") return `₹${value}M`;
  if (unit === "% margin") return `${value}%`;
  if (unit === "hrs") return `${value} hrs`;
  if (!unit) return String(value);
  return `${value} ${unit}`;
};

/**
 * Layer 2 — horizontal bar list. Supports diverging (negative) values for
 * profit/loss, and an optional trailing sized bubble for a secondary metric
 * (e.g. attention shifts / activity counts on "apps affecting focus").
 * Compact layout matches Application Usage / Website Usage widgets.
 */
export function BarList({ payload }: { payload: BarListPayload }) {
  const { items, unit, bubbles, bubbleLegend, insight } = payload;
  const maxAbs = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  const maxBubble = Math.max(...items.map((i) => i.bubble ?? 0), 1);
  const compact = !bubbles;

  return (
    <div className={cn("flex h-full min-h-0 flex-col", compact ? "gap-1.5" : "gap-2")}>
      <ul
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          compact ? "justify-start gap-1.5 overflow-hidden" : "thin-scrollbar justify-center gap-2 overflow-y-auto",
        )}
      >
        {items.map((it, index) => {
          const pct = (Math.abs(it.value) / maxAbs) * 100;
          const negative = it.value < 0;
          const color = it.color ?? (negative ? "#ef4444" : "#0ea5e9");
          const bubbleSize = it.bubble ? 16 + (it.bubble / maxBubble) * 14 : 0;
          const hasTooltip = it.idle != null || Boolean(it.time);
          const tooltipSide = index < 2 ? "bottom" : "top";
          const valueLabel = formatBarValue(it.value, unit);
          const bar = (
            <div
              className={cn(
                "w-full overflow-hidden rounded-full bg-muted/10",
                compact ? "h-2" : "h-2.5",
                !hasTooltip ? "flex-1" : "",
              )}
            >
              <div
                className="flex h-full items-center justify-end rounded-full px-1 text-[9px] font-medium text-white/90 transition-all"
                style={{ width: `${Math.max(6, pct)}%`, background: color }}
              >
                {bubbles ? it.value : ""}
              </div>
            </div>
          );
          return (
            <li
              key={it.label}
              className={cn(
                "grid items-center gap-2",
                bubbles
                  ? "grid-cols-[minmax(0,5.75rem)_1fr_auto]"
                  : "grid-cols-[minmax(0,6.5rem)_1fr_auto]",
              )}
            >
              <span className="truncate text-[11px] font-medium text-ink" title={it.label}>
                {it.label}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                {hasTooltip ? (
                  <Tooltip
                    side={tooltipSide}
                    wrapperClassName="min-w-0 flex-1"
                    className="whitespace-normal"
                    content={
                      <span className="flex flex-col gap-0.5 text-left font-normal leading-snug">
                        {it.idle != null ? (
                          <>
                            <span>Activity {it.value}%</span>
                            <span>Idle {it.idle}%</span>
                          </>
                        ) : (
                          <span>{valueLabel}</span>
                        )}
                        {it.time && <span>{it.time}</span>}
                      </span>
                    }
                  >
                    <span className="flex w-full cursor-default py-0.5" tabIndex={0}>
                      {bar}
                    </span>
                  </Tooltip>
                ) : (
                  bar
                )}
                {bubbles && it.bubble != null && (
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full bg-health-warn/20 text-[9px] font-semibold text-[#b45309]"
                    style={{ width: bubbleSize, height: bubbleSize }}
                    title={`${it.bubble} shifts`}
                  >
                    {it.bubble}
                  </span>
                )}
              </div>
              {!bubbles && (
                <span className="tabular shrink-0 whitespace-nowrap text-right text-[11px] font-semibold text-ink">
                  {valueLabel}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {bubbles && bubbleLegend && (
        <div className="flex shrink-0 items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-primary" /> {unit ?? "Value"}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-health-warn/40" /> {bubbleLegend}
          </span>
        </div>
      )}
      {insight && (
        <div className="flex shrink-0 items-start gap-2 rounded-xl bg-sky-50/90 px-3 py-2">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-600">{insight}</p>
        </div>
      )}
    </div>
  );
}
