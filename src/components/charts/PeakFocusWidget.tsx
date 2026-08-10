import React from "react";

const HOURS = [
  { label: "8 AM",  value: 35 },
  { label: "9 AM",  value: 55 },
  { label: "10 AM", value: 91 },
  { label: "11 AM", value: 85 },
  { label: "12 PM", value: 60 },
  { label: "1 PM",  value: 72 },
  { label: "2 PM",  value: 80 },
  { label: "3 PM",  value: 68 },
  { label: "4 PM",  value: 55 },
  { label: "5 PM",  value: 42 },
  { label: "6 PM",  value: 28 },
  { label: "7 PM",  value: 15 },
];

export function PeakFocusWidget() {
  const max = Math.max(...HOURS.map((h) => h.value));

  return (
    <div className="flex flex-col h-full justify-center gap-3">
      {/* Bar chart */}
      <div className="flex items-end justify-between gap-1 h-16 px-1">
        {HOURS.map((h) => {
          const pct = (h.value / max) * 100;
          const isPeak = h.value >= 85;
          return (
            <div
              key={h.label}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className={`w-full max-w-[16px] rounded-t transition-all ${
                  isPeak ? "bg-[#374151]" : "bg-[#cbd5e1]"
                }`}
                style={{ height: `${pct}%` }}
                title={`${h.label}: ${h.value}%`}
              />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between px-0.5">
        {HOURS.map((h) => (
          <span
            key={h.label}
            className="flex-1 text-center text-[7px] leading-tight text-muted-foreground font-medium"
          >
            {h.label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground font-medium text-center">
        Peak: 10–11 AM · 91% activity
      </p>
    </div>
  );
}
