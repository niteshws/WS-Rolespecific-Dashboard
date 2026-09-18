import { useState } from "react";
import type { ScatterPoint } from "@/types";

const HEALTH_COLOR: Record<string, string> = {
  good: "#10b981",
  warn: "#f59e0b",
  bad: "#ef4444",
};

/**
 * Layer 2 — interactive scatter/bubble plot. Supports an optional team filter
 * (fed by a Layer 1 drill-down) which dims non-matching points.
 * Fills the parent widget; plot area stretches to available space.
 */
export function ScatterChart({
  points,
  filterTeam,
}: {
  points: ScatterPoint[];
  filterTeam?: string | null;
}) {
  const [hover, setHover] = useState<ScatterPoint | null>(null);

  const W = 640;
  const H = 280;
  const pad = { l: 34, r: 10, t: 8, b: 26 };
  const xMin = 24;
  const xMax = 48;
  const yMin = 40;
  const yMax = 100;

  const sx = (x: number) =>
    pad.l + ((x - xMin) / (xMax - xMin)) * (W - pad.l - pad.r);
  const sy = (y: number) =>
    H - pad.b - ((y - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);

  const yTicks = [40, 55, 70, 85, 100];
  const xTicks = [24, 30, 36, 42, 48];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-1.5">
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Scatter plot of hours tracked versus productivity per team member"
        >
          {/* productivity guide band (deep-work healthy zone) */}
          <rect
            x={pad.l}
            y={sy(100)}
            width={W - pad.l - pad.r}
            height={sy(75) - sy(100)}
            fill="#10b981"
            opacity="0.05"
          />
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={pad.l}
                x2={W - pad.r}
                y1={sy(t)}
                y2={sy(t)}
                stroke="#374151"
                strokeOpacity="0.12"
                strokeDasharray="3 3"
              />
              <text x={pad.l - 6} y={sy(t) + 3} textAnchor="end" fontSize="9" fill="#6b7280">
                {t}%
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={sx(t)} y={H - 8} textAnchor="middle" fontSize="9" fill="#6b7280">
              {t}h
            </text>
          ))}

          {points.map((p) => {
            const dim = filterTeam ? p.team !== filterTeam : false;
            const isHover = hover?.id === p.id;
            return (
              <circle
                key={p.id}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={p.size / 2 + (isHover ? 3 : 0)}
                fill={HEALTH_COLOR[p.health]}
                fillOpacity={dim ? 0.12 : 0.68}
                stroke={HEALTH_COLOR[p.health]}
                strokeOpacity={dim ? 0.2 : 1}
                strokeWidth={isHover ? 2 : 1}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded bg-ink px-2 py-1.5 text-[11px] text-white shadow-pop"
            style={{
              left: `${(sx(hover.x) / W) * 100}%`,
              top: `${(sy(hover.y) / H) * 100}%`,
              transform: "translate(-50%, -130%)",
            }}
          >
            <div className="font-semibold">{hover.name}</div>
            <div className="text-white/70">
              {hover.team} · {hover.x}h · {hover.y}% productive
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {(["good", "warn", "bad"] as const).map((h) => (
          <span key={h} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: HEALTH_COLOR[h] }}
            />
            {h === "good" ? "Healthy" : h === "warn" ? "Watch" : "At risk"}
          </span>
        ))}
        <span className="text-muted-foreground/70">· Y: productivity · X: hours tracked</span>
      </div>
    </div>
  );
}
