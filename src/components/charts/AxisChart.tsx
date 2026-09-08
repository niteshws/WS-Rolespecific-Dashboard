import { useEffect, useMemo, useRef, useState } from "react";
import type { AxisChartPayload } from "@/types";

/** Round max value up to a clean tick ceiling. */
function niceMax(raw: number): number {
  if (raw <= 0) return 1;
  const padded = raw * 1.05;
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
  const normalized = padded / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/**
 * Layer 2 — combined cartesian chart. Renders bar series and line series on a
 * shared axis (covers Profit & Loss lines, Budget Trend bars + trend line, and
 * simple category bar charts like Member Location).
 */
export function AxisChart({ payload }: { payload: AxisChartPayload }) {
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 720, h: 200 });
  const { xLabels, series, unit } = payload;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      setSize({
        w: Math.max(280, Math.floor(el.clientWidth)),
        h: Math.max(140, Math.floor(el.clientHeight)),
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = size.w;
  const H = size.h;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const plotW = Math.max(1, width - pad.l - pad.r);
  const plotH = Math.max(1, H - pad.t - pad.b);

  const allVals = series.flatMap((s) => s.data);
  const dataMax = Math.max(...allVals, 1);
  const maxV = useMemo(() => {
    if (unit === "%") return 100;
    return niceMax(dataMax);
  }, [dataMax, unit]);

  const n = xLabels.length;
  const slot = plotW / Math.max(n, 1);
  const bars = series.filter((s) => s.kind === "bar");
  const lines = series.filter((s) => s.kind !== "bar");
  const barW = bars.length ? Math.min(slot * 0.62, Math.max(18, (slot * 0.72) / bars.length)) : 0;

  const yFor = (v: number) => pad.t + plotH - (v / maxV) * plotH;
  const xCenter = (i: number) => pad.l + slot * i + slot / 2;

  const yTicks = 4;
  const tickStep = maxV / yTicks;

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2">
      <div ref={wrapRef} className="relative min-h-0 w-full flex-1">
        <svg
          viewBox={`0 0 ${width} ${H}`}
          width="100%"
          height="100%"
          className="block h-full w-full"
          role="img"
          aria-label="Chart"
        >
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const v = tickStep * i;
            const y = yFor(v);
            const label = Number.isInteger(tickStep) ? String(Math.round(v)) : v.toFixed(v >= 10 ? 0 : 1);
            return (
              <g key={i}>
                <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="#374151" strokeOpacity="0.1" />
                <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7280">
                  {label}
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
              const h = Math.max(0, pad.t + plotH - y);
              return (
                <rect
                  key={`${s.key}-${i}`}
                  x={x}
                  y={y}
                  width={Math.max(2, barW - (bars.length > 1 ? 3 : 0))}
                  height={h}
                  rx="3"
                  fill={s.color}
                  onMouseEnter={() =>
                    setHover({
                      x,
                      y,
                      label: `${s.key} · ${xLabels[i]}: ${v}${unit ? ` ${unit}` : ""}`,
                    })
                  }
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
                  strokeWidth="2.25"
                  strokeDasharray={s.dashed ? "5 4" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {s.data.map((v, i) => (
                  <circle
                    key={i}
                    cx={xCenter(i)}
                    cy={yFor(v)}
                    r="3.5"
                    fill="#fff"
                    stroke={s.color}
                    strokeWidth="2"
                    onMouseEnter={() =>
                      setHover({
                        x: xCenter(i),
                        y: yFor(v),
                        label: `${s.key} · ${xLabels[i]}: ${v}${unit ? ` ${unit}` : ""}`,
                      })
                    }
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  />
                ))}
              </g>
            );
          })}

          {xLabels.map((l, i) => (
            <text
              key={`${l}-${i}`}
              x={xCenter(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {l.length > 14 ? `${l.slice(0, 13)}…` : l}
            </text>
          ))}
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-ink px-2 py-1 text-[10px] text-white shadow-pop"
            style={{ left: `${(hover.x / width) * 100}%`, top: `${(hover.y / H) * 100}%` }}
          >
            {hover.label}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-4">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color, opacity: s.kind === "bar" ? 1 : 0.9 }}
            />
            {s.key}
          </span>
        ))}
      </div>
    </div>
  );
}
