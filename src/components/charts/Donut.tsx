import type { DonutPayload } from "@/types";

/** Layer 2 — donut that scales to fill the card, with an optional center value. */
export function Donut({ payload }: { payload: DonutPayload }) {
  const { slices, centerValue, centerLabel } = payload;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative aspect-square h-full max-h-[280px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#37415115" strokeWidth="11" />
          {slices.map((s) => {
            const frac = s.value / total;
            const dash = frac * C;
            const el = (
              <circle
                key={s.key}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="11"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              >
                <title>{`${s.key}: ${Math.round(frac * 100)}%`}</title>
              </circle>
            );
            offset += dash;
            return el;
          })}
        </svg>
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-xl font-semibold leading-none text-zinc-700 dark:text-zinc-300">{centerValue}</span>
            {centerLabel && (
              <span className="mt-1 max-w-[80px] text-center text-[10px] leading-tight text-muted-foreground">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <ul className="thin-scrollbar grid max-h-full flex-1 grid-cols-1 content-center gap-x-4 gap-y-1 overflow-auto sm:grid-cols-2">
        {slices.map((s) => (
          <li
            key={s.key}
            className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs hover:bg-primary/[0.04]"
          >
            <span className="flex min-w-0 items-center gap-1.5 truncate text-zinc-700 dark:text-zinc-300">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
              <span className="truncate">{s.key}</span>
            </span>
            <span className="tabular shrink-0 font-medium text-muted">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
