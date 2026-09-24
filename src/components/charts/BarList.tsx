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

const InsightStrip = ({ insight }: { insight: string }) => (
  <div className="flex shrink-0 items-start gap-2 rounded-xl bg-sky-50/90 px-3 py-2.5">
    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden="true" />
    <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-600">{insight}</p>
  </div>
);

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

  const rows = items.map((it, index) => {
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
          "w-full min-w-0 overflow-hidden rounded-full bg-muted/10",
          compact ? "h-2" : "h-2.5",
        )}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(pct, 4)}%`, background: color }}
        />
      </div>
    );
    const barWithOptionalLabel = bubbles ? (
      <div
        className={cn(
          "w-full min-w-0 overflow-hidden rounded-full bg-muted/10",
          compact ? "h-2" : "h-2.5",
        )}
      >
        <div
          className="flex h-full items-center justify-end rounded-full px-1 text-[9px] font-medium text-white/90 transition-all"
          style={{ width: `${Math.max(pct, 6)}%`, background: color }}
        >
          {it.value}
        </div>
      </div>
    ) : (
      bar
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
        <span className="truncate text-[11px] font-medium text-zinc-700 dark:text-zinc-300" title={it.label}>
          {it.label}
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {hasTooltip ? (
            <Tooltip
              side={tooltipSide}
              wrapperClassName="block w-full min-w-0 flex-1"
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
              <span className="block w-full min-w-0 cursor-default py-0.5" tabIndex={0}>
                {barWithOptionalLabel}
              </span>
            </Tooltip>
          ) : (
            barWithOptionalLabel
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
          <span className="tabular shrink-0 whitespace-nowrap text-right text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            {valueLabel}
          </span>
        )}
      </li>
    );
  });

  const list = (
    <ul
      className={cn(
        "flex flex-col",
        compact ? "shrink-0 gap-1" : "thin-scrollbar min-h-0 flex-1 justify-center gap-2 overflow-y-auto",
      )}
    >
      {rows}
    </ul>
  );

  if (insight) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-2.5">
        <ul
          className={cn(
            "flex shrink-0 flex-col",
            compact ? "gap-1.5" : "thin-scrollbar gap-2 overflow-y-auto",
          )}
        >
          {rows}
        </ul>
        <InsightStrip insight={insight} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", compact ? "gap-1" : "h-full min-h-0 gap-2")}>
      {list}
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
    </div>
  );
}
