import type { GaugePayload } from "@/types";

/** Layer 2 — radial gauge for utilization / efficiency against a target. */
export function Gauge({ payload }: { payload: GaugePayload }) {
  const { value, max, centerValue, centerLabel, caption, target } = payload;
  const pct = Math.max(0, Math.min(1, value / max));
  const start = 150;
  const sweep = 240;
  const R = 46;
  const cx = 60;
  const cy = 58;

  const polar = (angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as const;
  };
  const arc = (fromPct: number, toPct: number) => {
    const a0 = start + sweep * fromPct;
    const a1 = start + sweep * toPct;
    const [x0, y0] = polar(a0);
    const [x1, y1] = polar(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`;
  };

  const color = pct >= 0.75 ? "#10b981" : pct >= 0.5 ? "#0ea5e9" : pct >= 0.3 ? "#f59e0b" : "#ef4444";
  const needleAngle = ((start + sweep * pct) * Math.PI) / 180;
  const [nx, ny] = [cx + (R - 8) * Math.cos(needleAngle), cy + (R - 8) * Math.sin(needleAngle)];

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-full max-h-[200px] shrink-0" style={{ aspectRatio: "120 / 96" }}>
        <svg viewBox="0 0 120 96" className="h-full w-full">
          <path d={arc(0, 1)} fill="none" stroke="#37415115" strokeWidth="10" strokeLinecap="round" />
          <path d={arc(0, pct)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#110302" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="3.5" fill="#110302" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className="tabular text-2xl font-semibold leading-none text-ink">{centerValue}</div>
          {centerLabel && <div className="mt-1 text-[11px] text-muted-foreground">{centerLabel}</div>}
        </div>
      </div>
      <div className="min-w-0 space-y-2">
        {caption && (
          <div className="inline-flex items-center gap-1.5 rounded bg-muted/5 px-2 py-1 text-xs font-medium text-ink">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {caption}
          </div>
        )}
        {target && <div className="text-[11px] text-muted-foreground">{target}</div>}
      </div>
    </div>
  );
}
