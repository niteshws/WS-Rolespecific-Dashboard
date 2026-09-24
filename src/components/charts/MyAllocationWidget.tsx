import React from "react";

export function MyAllocationWidget() {
  const stats = [
    { label: "Over Allocated", value: "0%", color: "text-red-500" },
    { label: "healthy", value: "78%", color: "text-emerald-600" },
    { label: "Under Utilised", value: "22%", color: "text-gray-500" },
  ];

  return (
    <div className="flex flex-col h-full justify-center gap-4">
      {/* Header row with green dot and Today badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">My allocation</span>
        </div>
        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
          Today
        </span>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-lg bg-[#f8f9fb] px-2 py-2.5"
          >
            <span className={`tabular text-base font-bold leading-none ${s.color}`}>
              {s.value}
            </span>
            <span className="mt-1 text-[9px] text-muted-foreground text-center leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: "78%" }}
        />
      </div>
    </div>
  );
}
