import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { UsagePiePayload } from "@/types";

const FILTERS = ["All Classifications", "Productive", "Neutral", "Unproductive"] as const;
type FilterOption = (typeof FILTERS)[number];

function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export function ProductivityFilter({
  value,
  onChange,
}: {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  label?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FilterOption)}
        aria-label="Classification filter"
        className="h-8 appearance-none rounded-full border border-border bg-card py-1 pl-3 pr-8 text-xs text-zinc-700 dark:text-zinc-300 focus-visible:border-primary focus-visible:outline-none"
      >
        {FILTERS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/** Application / Website usage — donut with durations and view-all footer. */
export function UsagePieWidget({
  payload,
  filter,
  onFilterChange,
  onViewAll,
}: {
  payload: UsagePiePayload;
  filter?: FilterOption;
  onFilterChange?: (value: FilterOption) => void;
  onViewAll?: () => void;
}) {
  const { slices, totalUsage, viewAllLabel = "View all" } = payload;
  const [internalFilter, setInternalFilter] = useState<FilterOption>("All Classifications");
  const activeFilter = filter ?? internalFilter;
  const setActiveFilter = onFilterChange ?? setInternalFilter;
  void activeFilter;
  void setActiveFilter;

  const total = useMemo(() => slices.reduce((sum, s) => sum + s.value, 0) || 1, [slices]);

  const cx = 50;
  const cy = 50;
  const R = 34;
  const C = 2 * Math.PI * R;

  let offset = 0;
  const rings = slices.map((s) => {
    const frac = s.value / total;
    const dash = frac * C;
    const startAngle = (offset / C) * 360;
    const midAngle = startAngle + frac * 180;
    offset += dash;
    const [lx, ly] = polar(cx, cy, R, midAngle);
    return { ...s, dash, offset: offset - dash, frac, lx, ly, showLabel: frac >= 0.06 };
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 items-start gap-4">
        <div className="relative aspect-square w-[148px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e5e7eb" strokeWidth="14" />
            {rings.map((s) => (
              <circle
                key={s.key}
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${s.dash} ${C - s.dash}`}
                strokeDashoffset={-s.offset}
                strokeLinecap="butt"
              >
                <title>{`${s.key}: ${Math.round(s.frac * 100)}%`}</title>
              </circle>
            ))}
          </svg>
          {/* percentage labels (unrotated overlay) */}
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
            {rings.map(
              (s) =>
                s.showLabel && (
                  <text
                    key={`${s.key}-label`}
                    x={s.lx}
                    y={s.ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 6.5, fontWeight: 700, fill: "#fff" }}
                  >
                    {Math.round(s.frac * 100)}%
                  </text>
                ),
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-base font-semibold leading-none text-zinc-700 dark:text-zinc-300">{totalUsage}</span>
            <span className="mt-1 text-[10px] text-muted-foreground">Total Usage</span>
          </div>
        </div>

        <ul className="thin-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
          {slices.map((s) => (
            <li key={s.key} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
              <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">{s.key}</span>
              <span className="tabular shrink-0 text-muted-foreground">{s.duration}</span>
              <span className="tabular w-8 shrink-0 text-right font-medium text-zinc-700 dark:text-zinc-300">
                {Math.round((s.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {onViewAll && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
          >
            {viewAllLabel}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
