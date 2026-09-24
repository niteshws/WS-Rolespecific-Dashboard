import React from "react";

export function PersonalAllocationWidget({ type = "apps" }: { type?: "apps" | "websites" }) {
  const data = type === "apps" ? [
    { label: "VS Code", percent: 38, color: "bg-primary" },
    { label: "Figma", percent: 22, color: "bg-[#a259ff]" },
    { label: "Slack", percent: 18, color: "bg-health-warn" },
  ] : [
    { label: "github.com", percent: 18, color: "bg-primary/80" },
    { label: "figma.com", percent: 14, color: "bg-[#a259ff]/80" },
  ];

  return (
    <div className="flex flex-col gap-3 h-full justify-center">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
            <span className="text-muted-foreground">{item.percent}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
