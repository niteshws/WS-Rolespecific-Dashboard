import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import type { TaskTimelineSummaryPayload } from "@/types";

const CREATED_COLOR = "#7c3aed";
const COMPLETED_COLOR = "#10b981";
const Y_MAX = 100;

/** Year range control shown in the widget header (beside View report). */
export function TaskTimelineYearBadge({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-sm transition-colors hover:bg-muted/10"
      aria-label="Select year"
    >
      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span>{label}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}

/** Layer 2 — dual-series area chart of created vs completed tasks. */
export function TaskTimelineSummaryWidget({ payload }: { payload: TaskTimelineSummaryPayload }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(8);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 320 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = (): void => {
      setSize({
        w: Math.max(320, Math.floor(el.clientWidth)),
        h: Math.max(240, Math.floor(el.clientHeight)),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = size.w;
  const height = size.h;
  const pad = { l: 44, r: 12, t: 32, b: 26 };
  const plotW = Math.max(1, width - pad.l - pad.r);
  const plotH = Math.max(1, height - pad.t - pad.b);
  const n = payload.points.length;
  const slot = plotW / Math.max(n, 1);
  const xCenter = (i: number): number => pad.l + slot * i + slot / 2;
  const yFor = (v: number): number => pad.t + plotH - (v / Y_MAX) * plotH;

  const createdPath = useMemo(
    () =>
      payload.points
        .map((p, i) => `${i === 0 ? "M" : "L"}${xCenter(i)},${yFor(p.created)}`)
        .join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payload.points, width, height],
  );
  const completedPath = useMemo(
    () =>
      payload.points
        .map((p, i) => `${i === 0 ? "M" : "L"}${xCenter(i)},${yFor(p.completed)}`)
        .join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payload.points, width, height],
  );

  const areaClose = (path: string): string => {
    if (!n) return "";
    const lastX = xCenter(n - 1);
    const firstX = xCenter(0);
    const baseY = pad.t + plotH;
    return `${path} L${lastX},${baseY} L${firstX},${baseY} Z`;
  };

  const hover = hoverIdx !== null ? payload.points[hoverIdx] : null;
  const yTicks = [0, 20, 40, 60, 80, 100];

  return (
    <div ref={wrapRef} className="relative h-full min-h-0 w-full">
      <div className="pointer-events-none absolute right-1 top-0 z-[1] flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CREATED_COLOR }} />
          Created Tasks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: COMPLETED_COLOR }} />
          Completed Tasks
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="block h-full w-full"
        role="img"
        aria-label="Created versus completed tasks over time"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="ttl-created-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CREATED_COLOR} stopOpacity="0.28" />
            <stop offset="100%" stopColor={CREATED_COLOR} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="ttl-completed-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COMPLETED_COLOR} stopOpacity="0.22" />
            <stop offset="100%" stopColor={COMPLETED_COLOR} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <text
          x={12}
          y={height / 2}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          Number of tasks
        </text>

        {yTicks.map((v) => {
          const y = yFor(v);
          return (
            <g key={v}>
              <line
                x1={pad.l}
                x2={width - pad.r}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
                {v}
              </text>
            </g>
          );
        })}

        <path d={areaClose(createdPath)} fill="url(#ttl-created-fill)" />
        <path d={areaClose(completedPath)} fill="url(#ttl-completed-fill)" />

        <path
          d={createdPath}
          fill="none"
          stroke={CREATED_COLOR}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={completedPath}
          fill="none"
          stroke={COMPLETED_COLOR}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {hoverIdx !== null && (
          <line
            x1={xCenter(hoverIdx)}
            x2={xCenter(hoverIdx)}
            y1={pad.t}
            y2={pad.t + plotH}
            stroke="#94a3b8"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
        )}

        {payload.points.map((p, i) => {
          const cx = xCenter(i);
          const cyCreated = yFor(p.created);
          const cyCompleted = yFor(p.completed);
          return (
            <g key={p.month}>
              <rect
                x={cx - slot / 2}
                y={pad.t}
                width={slot}
                height={plotH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIdx(i)}
              />
              <text
                x={cx}
                y={cyCreated - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={CREATED_COLOR}
              >
                {p.created}
              </text>
              <circle cx={cx} cy={cyCreated} r="4.5" fill="#fff" stroke={CREATED_COLOR} strokeWidth="2.25" />
              <circle cx={cx} cy={cyCompleted} r="4.5" fill="#fff" stroke={COMPLETED_COLOR} strokeWidth="2.25" />
              <text
                x={cx}
                y={cyCompleted + 16}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={COMPLETED_COLOR}
              >
                {p.completed}
              </text>
              <text x={cx} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748b">
                {p.month}
              </text>
            </g>
          );
        })}
      </svg>

      {hover && hoverIdx !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl bg-slate-800 px-3.5 py-2.5 text-white shadow-lg"
          style={{
            left: `${(xCenter(hoverIdx) / width) * 100}%`,
            top: `${Math.max(8, ((yFor(Math.max(hover.created, hover.completed)) / height) * 100) - 18)}%`,
            transform: "translate(-50%, -110%)",
          }}
        >
          <p className="mb-1.5 text-[11px] font-semibold">{hover.fullLabel}</p>
          <div className="flex flex-col gap-1 text-[11px]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: CREATED_COLOR }} />
              Created Tasks{" "}
              <span className="ml-auto font-semibold tabular">{hover.created}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: COMPLETED_COLOR }} />
              Completed Tasks{" "}
              <span className="ml-auto font-semibold tabular">{hover.completed}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
