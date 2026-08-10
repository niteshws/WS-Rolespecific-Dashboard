import type { CategoriesPayload } from "@/types";

/** Layer 2 — a single full-width stacked bar for category share, with legend. */
export function CategoriesBar({ payload }: { payload: CategoriesPayload }) {
  const total = payload.segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex h-6 w-full overflow-hidden rounded bg-muted/5">
        {payload.segments.map((seg) => (
          <div
            key={seg.key}
            className="h-full transition-all hover:brightness-110"
            style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
            title={`${seg.key}: ${seg.value}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {payload.segments.map((seg) => (
          <span key={seg.key} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-2 w-2 rounded-sm" style={{ background: seg.color }} />
            {seg.key}
          </span>
        ))}
        {payload.moreCount ? (
          <span className="rounded bg-muted/10 px-1.5 py-0.5 text-[10px] font-medium text-muted">
            +{payload.moreCount} More
          </span>
        ) : null}
      </div>
    </div>
  );
}
