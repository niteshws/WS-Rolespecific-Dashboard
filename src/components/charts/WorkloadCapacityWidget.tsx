import { cn } from "@/lib/utils";
import type { WorkloadBand, WorkloadCapacityPayload } from "@/types";

const BAND_STYLES: Record<WorkloadBand, { pill: string; pct: string }> = {
  "Over-allocated": {
    pill: "border-health-bad/25 bg-health-bad/10 text-health-bad",
    pct: "text-health-bad",
  },
  Healthy: {
    pill: "border-health-good/25 bg-health-good/10 text-health-good",
    pct: "text-health-good",
  },
  "Under-utilized": {
    pill: "border-[#0ea5e9]/25 bg-[#0ea5e9]/10 text-[#0284c7]",
    pct: "text-[#0284c7]",
  },
};

/**
 * Layer 2 — workload capacity table.
 * Columns: Name | Available | Capacity % | Billable % | Band
 */
export function WorkloadCapacityWidget({ payload }: { payload: WorkloadCapacityPayload }) {
  return (
    <div className="h-full overflow-hidden">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="border-b border-border bg-card px-2 py-1.5 text-left font-medium text-muted-foreground">
              Name
            </th>
            <th className="border-b border-border bg-card px-2 py-1.5 text-right font-medium text-muted-foreground">
              Available
            </th>
            <th className="border-b border-border bg-card px-2 py-1.5 text-right font-medium text-muted-foreground">
              Capacity %
            </th>
            <th className="border-b border-border bg-card px-2 py-1.5 text-right font-medium text-muted-foreground">
              Billable %
            </th>
            <th className="border-b border-border bg-card px-2 py-1.5 text-left font-medium text-muted-foreground">
              Band
            </th>
          </tr>
        </thead>
        <tbody>
          {payload.rows.map((row) => {
            const tone = BAND_STYLES[row.band];
            return (
              <tr key={row.name} className="hover:bg-primary/[0.03]">
                <td className="border-b border-border/60 px-2 py-1.5">
                  <span className="truncate font-medium text-ink">{row.name}</span>
                </td>
                <td className="border-b border-border/60 px-2 py-1.5 text-right tabular font-medium text-ink">
                  {row.available}
                </td>
                <td className={cn("border-b border-border/60 px-2 py-1.5 text-right tabular font-medium", tone.pct)}>
                  {row.capacityPct.toFixed(2)}%
                </td>
                <td className={cn("border-b border-border/60 px-2 py-1.5 text-right tabular font-medium", tone.pct)}>
                  {row.billablePct.toFixed(2)}%
                </td>
                <td className="border-b border-border/60 px-2 py-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap",
                      tone.pill,
                    )}
                  >
                    {row.band}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
