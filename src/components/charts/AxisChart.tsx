import { useState } from "react";
import type { AxisChartPayload } from "@/types";

/**
 * Layer 2 — combined cartesian chart. Renders bar series and line series on a
 * shared axis (covers Profit & Loss lines, Budget Trend bars + trend line, and
 * simple category bar charts like Member Location).
 */
export function AxisChart({ payload }: { payload: AxisChartPayload }) {
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);
  const { xLabels, series } = payload;

  const W = 640;
  const H = 240;
  const pad = { l: 40, r: 12, t: 16, b: 34 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const allVals = series.flatMap((s) => s.data);
  const maxV = Math.max(...allVals, 1) * 1.1;

  const n = xLabels.length;
  const slot = plotW / n;
  const bars = series.filter((s) => s.kind === "bar");
  const lines = series.filter((s) => s.kind !== "bar");
  const barW = bars.length ? Math.min(28, (slot * 0.6) / bars.length) : 0;

  const yFor = (v: number) => pad.t + plotH - (v / maxV) * plotH;
  const xCenter = (i: number) => pad.l + slot * i + slot / 2;

  const yTicks = 4;

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Chart">
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const v = (maxV / yTicks) * i;
            const y = yFor(v);
            return (
              <g key={i}>
                <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#374151" strokeOpacity="0.1" />
                <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="8" fill="#6b7280">
                  {Math.round(v)}
                </text>
              </g>
            );
          })}

          {/* bars */}
          {bars.map((s, si) =>
            s.data.map((v, i) => {
              const groupW = barW * bars.length;
              const x = xCenter(i) - groupW / 2 + si * barW;
              const y = yFor(v);
              return (
                <rect
                  key={`${s.key}-${i}`}
                  x={x}
                  y={y}
                  width={barW - 2}
                  height={pad.t + plotH - y}
                  rx="2"
                  fill={s.color}
                  onMouseEnter={() => setHover({ x, y, label: `${s.key} · ${xLabels[i]}: ${v}` })}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                />
              );
            }),
          )}

          {/* lines */}
          {lines.map((s) => {
            const d = s.data
              .map((v, i) => `${i === 0 ? "M" : "L"}${xCenter(i)},${yFor(v)}`)
              .join(" ");
            return (
              <g key={s.key}>
                <path
                  d={d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeDasharray={s.dashed ? "5 4" : undefined}
                  strokeLinecap="round"
                />
                {s.data.map((v, i) => (
                  <circle
                    key={i}
                    cx={xCenter(i)}
                    cy={yFor(v)}
                    r="2.75"
                    fill="#fff"
                    stroke={s.color}
                    strokeWidth="1.75"
                    onMouseEnter={() =>
                      setHover({ x: xCenter(i), y: yFor(v), label: `${s.key} · ${xLabels[i]}: ${v}` })
                    }
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  />
                ))}
              </g>
            );
          })}

          {xLabels.map((l, i) => (
            <text key={l} x={xCenter(i)} y={H - 12} textAnchor="middle" fontSize="8" fill="#6b7280">
              {l.length > 12 ? l.slice(0, 11) + "…" : l}
            </text>
          ))}
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-ink px-2 py-1 text-[10px] text-white shadow-pop"
            style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / H) * 100}%` }}
          >
            {hover.label}
          </div>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: s.color, opacity: s.kind === "bar" ? 1 : 0.9 }}
            />
            {s.key}
          </span>
        ))}
      </div>
    </div>
  );
}
