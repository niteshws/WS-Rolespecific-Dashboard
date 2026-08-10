import type { SegmentBarPayload } from "@/types";

/**
 * Layer 2 — headline value + a 100% stacked classification bar with legend
 * (e.g. Work Time Classification: core / non-core / neutral, Activity ranges).
 */
export function SegmentBar({ payload }: { payload: SegmentBarPayload }) {
  const total = payload.segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      {payload.headline && (
        <div>
          <div className="tabular text-2xl font-semibold leading-none text-primary">
            {payload.headline.value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{payload.headline.label}</div>
        </div>
      )}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/10">
        {payload.segments.map((seg) => (
          <div
            key={seg.key}
            className="h-full transition-all hover:brightness-110"
            style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
            title={`${seg.key}: ${Math.round((seg.value / total) * 100)}%`}
          />
        ))}
      </div>
      {payload.showAxis && (
        <div className="flex justify-between text-[9px] text-muted-foreground">
          {[0, 25, 50, 75, 100].map((t) => (
            <span key={t}>{t}%</span>
          ))}
        </div>
      )}
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {payload.segments.map((seg) => (
          <li key={seg.key} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-2 w-2 rounded-sm" style={{ background: seg.color }} />
            {seg.key}
            <span className="tabular font-medium text-ink">{Math.round((seg.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
