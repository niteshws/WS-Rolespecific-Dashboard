import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export function MyDashboardBanner() {
  return (
    <div className="rounded border border-border bg-card p-5 shadow-sm flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm">
            PS
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">My workday at a glance</h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-health-good animate-pulse" />
              <span>Tracking <strong>Fintech Dashboard v2</strong> · 6h 14m today</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-semibold px-3 border-border hover:bg-muted/10">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Log time
          </Button>
        </div>
      </div>

      {/* Timeline Strip Section */}
      <div className="space-y-2 mt-2">
        <div className="flex justify-between items-end text-[11px] font-semibold">
          <span className="text-muted-foreground">Today's timeline</span>
          <span className="text-ink">6h 14m tracked · 78% of 8h target</span>
        </div>

        {/* Timeline Bar */}
        <div className="relative">
          <div className="h-3.5 w-full bg-[#f1f5f9] rounded flex overflow-hidden">
            {/* 9:00 - 9:45 (Work - Green) */}
            <div className="h-full bg-teal-600" style={{ width: "8.3%" }} title="9:00 - 9:45" />
            {/* 9:45 - 10:00 (Idle - striped) */}
            <div className="h-full bg-muted/20 bg-stripes" style={{ width: "2.7%" }} title="9:45 - 10:00 (Idle)" />
            {/* 10:00 - 11:30 (Work - Green) */}
            <div className="h-full bg-teal-600 border-l border-white/20" style={{ width: "16.7%" }} title="10:00 - 11:30" />
            {/* 11:30 - 11:45 (Meeting - Blue) */}
            <div className="h-full bg-blue-600" style={{ width: "2.7%" }} title="11:30 - 11:45" />
            {/* 11:45 - 12:15 (Break - Orange) */}
            <div className="h-full bg-amber-500" style={{ width: "5.5%" }} title="11:45 - 12:15 (Break)" />
            {/* 12:15 - 2:00 (Work - Green) */}
            <div className="h-full bg-teal-600 border-l border-white/20" style={{ width: "19.4%" }} title="12:15 - 2:00" />
            {/* 2:00 - 2:15 (Idle - striped) */}
            <div className="h-full bg-muted/20 bg-stripes" style={{ width: "2.7%" }} title="2:00 - 2:15 (Idle)" />
            {/* 2:15 - 3:30 (Break/Task - Pink) */}
            <div className="h-full bg-pink-600" style={{ width: "13.9%" }} title="2:15 - 3:30" />
            {/* 3:30 - 4:30 (Work - Green) */}
            <div className="h-full bg-teal-600 border-l border-white/20" style={{ width: "11.1%" }} title="3:30 - 4:30" />
            {/* 4:30 - 6:00 (Remaining/Grey) */}
            <div className="h-full bg-[#e2e8f0]" style={{ width: "16.5%" }} title="4:30 - 6:00 (Remaining)" />
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
            <span>9a</span>
            <span>10</span>
            <span>11</span>
            <span>12p</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6p</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 items-center text-[10px] font-semibold text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Break</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 bg-muted/30 border border-muted-foreground/30 bg-stripes rounded-sm" />
            <span>Idle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
