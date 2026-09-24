import type { ProgressRingPayload } from "@/types";

/** Layer 2 — large circular progress ring with side stats (e.g. Daily Focus). */
export function ProgressRing({ payload }: { payload: ProgressRingPayload }) {
  const pct = Math.max(0, Math.min(100, payload.percent));
  const R = 46;
  const C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;

  return (
    <div className="flex h-full items-center gap-5">
      <ul className="min-w-0 flex-1 space-y-3">
        {payload.stats.map((s) => (
          <li key={s.label} className="border-l-2 border-primary/30 pl-3">
            <div className="tabular text-xl font-semibold leading-none text-primary">{s.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{s.label}</div>
          </li>
        ))}
      </ul>
      <div className="relative aspect-square h-full max-h-[200px] shrink-0">
        <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
          <circle cx="55" cy="55" r={R} fill="none" stroke="#37415112" strokeWidth="10" />
          <circle
            cx="55"
            cy="55"
            r={R}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C - dash}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="tabular text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{pct}%</span>
        </div>
      </div>
    </div>
  );
}
