import type { BarListPayload } from "@/types";

/**
 * Layer 2 — horizontal bar list. Supports diverging (negative) values for
 * profit/loss, and an optional trailing sized bubble for a secondary metric
 * (e.g. attention shifts / activity counts on "apps affecting focus").
 */
export function BarList({ payload }: { payload: BarListPayload }) {
  const { items, unit, diverging, bubbles, bubbleLegend } = payload;
  const maxAbs = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  const maxBubble = Math.max(...items.map((i) => i.bubble ?? 0), 1);

  return (
    <div className="flex h-full flex-col gap-2">
      <ul className="thin-scrollbar flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-y-auto">
        {items.map((it) => {
          const pct = (Math.abs(it.value) / maxAbs) * 100;
          const negative = it.value < 0;
          const color = it.color ?? (negative ? "#ef4444" : "#0ea5e9");
          const bubbleSize = it.bubble ? 16 + (it.bubble / maxBubble) * 14 : 0;
          return (
            <li
              key={it.label}
              className={cn3("grid items-center gap-2", bubbles ? "grid-cols-[92px_1fr_auto]" : "grid-cols-[130px_1fr_auto]")}
            >
              <span className="truncate text-[11px] text-ink" title={it.label}>
                {it.label}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-4 flex-1 rounded bg-muted/5">
                  <div
                    className="flex h-full items-center justify-end rounded px-1 text-[9px] font-medium text-white/90 transition-all"
                    style={{ width: `${Math.max(6, pct)}%`, background: color }}
                  >
                    {bubbles ? it.value : ""}
                  </div>
                </div>
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
                <span className="tabular w-14 text-right text-[11px] font-medium text-muted">
                  {it.value}
                  {unit ? ` ${unit}` : ""}
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
    </div>
  );
}

function cn3(...c: string[]) {
  return c.join(" ");
}
