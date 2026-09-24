import React from "react";

export function MyActionItemsWidget() {
  const items = [
    {
      title: "Submit today's timesheet",
      desc: "6.2h logged · 2 entries missing notes",
      due: "Due today",
      color: "bg-health-warn",
    },
    {
      title: "1 task overdue",
      desc: "Review API spec changes",
      due: "1 day late",
      color: "bg-health-bad",
    },
    {
      title: "Weekly standup in 45 min",
      desc: "Product Team · 11:00 AM",
      due: "45m",
      color: "bg-primary",
    },
  ];

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
            <div className="flex-1 min-w-0 leading-tight">
              <div className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">{item.title}</div>
              <div className="text-[11px] text-muted-foreground truncate mt-0.5">{item.desc}</div>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground bg-muted/5 px-1.5 py-0.5 rounded font-medium">
              {item.due}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
