import React from "react";

export function LeaveBalanceWidget() {
  const categories = [
    { label: "Casual Leave", used: 0, total: 6.5, color: "#e2e8f0", trackColor: "#f1f5f9" },
    { label: "default policy", used: 10.5, total: 21, color: "#f97316", trackColor: "#fff7ed" },
    { label: "Privileged\nLeave", used: 0, total: 13, color: "#e2e8f0", trackColor: "#f1f5f9" },
  ];

  return (
    <div className="flex justify-around items-center h-full gap-2">
      {categories.map((cat, i) => {
        const percent = cat.total > 0 ? Math.min(100, Math.round((cat.used / cat.total) * 100)) : 0;
        const radius = 28;
        const circ = 2 * Math.PI * radius;
        const strokeDashoffset = circ - (percent / 100) * circ;

        return (
          <div key={i} className="flex flex-col items-center text-center gap-1.5">
            <div className="relative h-[68px] w-[68px] flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 68 68">
                <circle
                  cx="34"
                  cy="34"
                  r={radius}
                  fill="none"
                  stroke={cat.trackColor}
                  strokeWidth="5"
                />
                <circle
                  cx="34"
                  cy="34"
                  r={radius}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="5"
                  strokeDasharray={circ}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col leading-none text-zinc-700 dark:text-zinc-300 items-center">
                <span className="text-[11px] font-bold tabular">{cat.used}/{cat.total}</span>
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground font-medium leading-tight whitespace-pre-line max-w-[72px]">
              {cat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
