import { Donut } from "./Donut";
import type { MembersPayload } from "@/types";

/** Layer 2 — members presence donut + device breakdown chips (mirrors WS). */
export function MembersWidget({ payload }: { payload: MembersPayload }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="min-h-0 flex-1">
        <Donut
          payload={{
            slices: [
              { key: `Online ${payload.online}`, value: payload.online, color: "#0ea5e9" },
              { key: `Offline ${payload.offline}`, value: payload.offline, color: "#e5e7eb" },
            ],
            centerValue: String(payload.total),
            centerLabel: "Total Members",
          }}
        />
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-border pt-3">
        {payload.devices.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded bg-muted/5 px-2 py-1">
            <span className="text-[10px] text-muted-foreground">{d.name}</span>
            <span className="tabular text-xs font-semibold text-ink">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
