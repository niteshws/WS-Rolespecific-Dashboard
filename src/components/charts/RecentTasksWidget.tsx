import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function RecentTasksWidget() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "overdue" | "completed">("upcoming");

  const tasks = {
    upcoming: [
      { name: "For eligibility criteria related to lab value, verify all baseline...", due: "Today", color: "text-health-good" },
      { name: "If AE start date is a partial date, this should be checked", due: "Tomorrow", color: "text-health-good" },
      { name: "If at least one in/exclusion criterion is violated, the reason...", due: "26 Mar, 2026", color: "text-muted-foreground" },
      { name: "AE with outcome as fatal should be reported as reason for...", due: "27 Mar, 2026", color: "text-muted-foreground" },
      { name: "AE that is reported as reason for death on Death form...", due: "28 Mar, 2026", color: "text-muted-foreground" },
    ],
    overdue: [
      { name: "Fix console error in dashboard initialization", due: "3 days ago", color: "text-health-bad" },
      { name: "Update styles of datepicker to prevent overlap", due: "Yesterday", color: "text-health-bad" },
    ],
    completed: [
      { name: "Optimize Bento Grid height for categories widget", due: "Completed", color: "text-muted-foreground" },
      { name: "Remove L1/L2/L3 badges from report view", due: "Completed", color: "text-muted-foreground" },
    ],
  };

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div>
        {/* Tabs */}
        <div className="flex border-b border-border/60 gap-4 mb-3 text-xs">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "pb-2 font-semibold transition-colors relative",
              activeTab === "upcoming" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-ink"
            )}
          >
            Upcoming (12)
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={cn(
              "pb-2 font-semibold transition-colors relative",
              activeTab === "overdue" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-ink"
            )}
          >
            Over Due (6)
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "pb-2 font-semibold transition-colors relative",
              activeTab === "completed" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-ink"
            )}
          >
            Completed (8)
          </button>
        </div>

        {/* Task list header */}
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
          <span>Task Name</span>
          <span>Due On</span>
        </div>

        {/* Task rows */}
        <div className="flex flex-col gap-2">
          {tasks[activeTab].map((task, idx) => (
            <div key={idx} className="flex justify-between items-center gap-3 text-xs">
              <span className="truncate text-ink font-medium flex-1">{task.name}</span>
              <span className={cn("shrink-0 text-[11px]", task.color)}>{task.due}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
