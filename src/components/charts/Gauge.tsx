import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GaugePayload } from "@/types";

/** Layer 2 — utilization gauge: left metrics + red/green semicircle needle. */
export function Gauge({ payload }: { payload: GaugePayload }) {
  const {
    value,
    max,
    centerValue,
    centerLabel,
    caption,
    target,
    headlineValue,
    headlineLabel,
  } = payload;

  const pct = Math.max(0, Math.min(1, value / max));
  const isHeadline = Boolean(headlineValue);
  const isAbove = pct >= 0.5;

  // Semicircle: left (180°) → top (270°) → right (360°); split red/green at top.
  const start = 180;
  const sweep = 180;
  const R = isHeadline ? 54 : 58;
  const stroke = isHeadline ? 12 : 14;
  const cx = isHeadline ? 72 : 80;
  const cy = isHeadline ? 62 : 70;
  const vbW = isHeadline ? 144 : 160;
  const vbH = isHeadline ? 82 : 92;

  const polar = (angleDeg: number, radius = R) => {
    const a = (angleDeg * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
  };

  const arc = (fromPct: number, toPct: number) => {
    const a0 = start + sweep * fromPct;
    const a1 = start + sweep * toPct;
    const [x0, y0] = polar(a0);
    const [x1, y1] = polar(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`;
  };

  const needleAngle = start + sweep * pct;
  const [tipX, tipY] = polar(needleAngle, R - 7);
  const [baseLx, baseLy] = polar(needleAngle - 90, 4);
  const [baseRx, baseRy] = polar(needleAngle + 90, 4);

  const gauge = (
    <div className="flex shrink-0 flex-col items-center">
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className={cn("w-auto max-w-full", isHeadline ? "h-[96px]" : "h-[110px]")}
        aria-hidden="true"
      >
        <path
          d={arc(0, 0.5)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={stroke}
          strokeLinecap="butt"
        />
        <path
          d={arc(0.5, 1)}
          fill="none"
          stroke="#22c55e"
          strokeWidth={stroke}
          strokeLinecap="butt"
        />
        <polygon
          points={`${tipX},${tipY} ${baseLx},${baseLy} ${baseRx},${baseRy}`}
          fill="#374151"
        />
        <circle cx={cx} cy={cy} r="4.5" fill="#374151" />
        <circle cx={cx} cy={cy} r="1.75" fill="#ffffff" />
      </svg>

      <div className="text-center">
        <div
          className={cn(
            "tabular font-semibold leading-none text-zinc-700 dark:text-zinc-300",
            isHeadline ? "text-xl" : "text-2xl",
          )}
        >
          {centerValue}
        </div>
        {centerLabel && (
          <div className="mt-1 text-[11px] text-muted-foreground">{centerLabel}</div>
        )}
      </div>
    </div>
  );

  if (isHeadline) {
    return (
      <div className="flex h-full items-center justify-between gap-4 px-1 py-1">
        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-1">
          <div>
            <div className="tabular text-2xl font-semibold leading-none text-zinc-700 dark:text-zinc-300">
              {headlineValue}
            </div>
            {headlineLabel && (
              <div
                className={cn(
                  "mt-1 text-xs",
                  isAbove ? "text-health-good" : "text-health-bad",
                )}
              >
                {headlineLabel}
              </div>
            )}
          </div>
          {target && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{target}</span>
            </div>
          )}
        </div>

        <div className="shrink-0">{gauge}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center gap-4">
      {gauge}
      {(caption || target) && (
        <div className="min-w-0 space-y-2">
          {caption && (
            <div className="inline-flex items-center gap-1.5 rounded bg-muted/5 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {caption}
            </div>
          )}
          {target && <div className="text-[11px] text-muted-foreground">{target}</div>}
        </div>
      )}
    </div>
  );
}
