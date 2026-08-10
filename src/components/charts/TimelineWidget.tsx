import React from "react";

export function TimelineWidget({ dateRange = "This week" }: { dateRange?: string }) {
  let rows: { name: string; activity: number; label: string }[] = [];

  if (dateRange === "Today") {
    rows = [
      { name: "Morning", activity: 85, label: "9 AM - 12 PM" },
      { name: "Midday", activity: 92, label: "12 PM - 3 PM" },
      { name: "Afternoon", activity: 64, label: "3 PM - 6 PM" },
    ];
  } else if (dateRange === "This month") {
    rows = [
      { name: "Week 1", activity: 88, label: "01 Aug - 07 Aug" },
      { name: "Week 2", activity: 72, label: "08 Aug - 14 Aug" },
      { name: "Week 3", activity: 80, label: "15 Aug - 21 Aug" },
      { name: "Week 4", activity: 65, label: "22 Aug - 28 Aug" },
    ];
  } else {
    // "This week" or custom ranges
    rows = [
      { name: "Mon", activity: 85, label: "8h 15m" },
      { name: "Tue", activity: 92, label: "8h 45m" },
      { name: "Wed", activity: 64, label: "7h 30m" },
      { name: "Thu", activity: 78, label: "8h 05m" },
      { name: "Fri", activity: 88, label: "8h 12m" },
    ];
  }

  return (
    <div className="flex flex-col gap-3 h-full justify-center">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-3">
          <span className="w-14 text-xs font-semibold text-ink">{row.name}</span>
          <div className="flex-1 flex gap-0.5 h-3.5 bg-muted/5 rounded overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => {
              let color = "bg-muted/10";
              const valSeed = row.activity + i;
              const rand = Math.sin(valSeed);
              if (rand > 0.45) color = "bg-health-good";
              else if (rand > -0.15) color = "bg-health-warn";
              else color = "bg-health-bad";

              return (
                <div
                  key={i}
                  className={`flex-1 ${color} rounded-sm transition-opacity hover:opacity-80`}
                  title={`${i}:00`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-muted-foreground tabular w-20 text-right">
            {row.label}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground mt-2 border-t border-border/40 pt-2">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-health-good" /> Productive
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-health-warn" /> Idle/Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-health-bad" /> Distracting
        </span>
      </div>
    </div>
  );
}
