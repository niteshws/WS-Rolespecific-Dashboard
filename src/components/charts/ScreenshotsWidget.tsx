import React from "react";
import { Monitor } from "lucide-react";

export function ScreenshotsWidget() {
  const screenshots = [
    { time: "09:15 AM", app: "Cursor", activity: "96%" },
    { time: "10:00 AM", app: "Figma", activity: "88%" },
    { time: "10:45 AM", app: "docs.google.com", activity: "92%" },
    { time: "11:30 AM", app: "Slack", activity: "75%" },
    { time: "12:15 PM", app: "Jira", activity: "82%" },
    { time: "02:00 PM", app: "Cursor", activity: "94%" },
    { time: "02:45 PM", app: "docs.google.com", activity: "85%" },
    { time: "03:30 PM", app: "Figma", activity: "90%" },
    { time: "04:15 PM", app: "chatgpt.com", activity: "78%" },
  ];

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="grid grid-cols-3 gap-2 flex-1 items-center">
        {screenshots.map((s, i) => (
          <div key={i} className="relative rounded border border-border bg-muted/5 p-0.5 group hover:border-primary/40 transition-colors">
            <div className="aspect-[16/10] bg-muted/10 rounded flex items-center justify-center text-muted-foreground/30 relative overflow-hidden">
              <Monitor className="h-6 w-6" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end p-1 text-white">
                <span className="text-[9px] font-semibold truncate">{s.app}</span>
                <div className="flex items-center justify-between text-[7px] text-white/80">
                  <span>{s.time}</span>
                  <span className="text-health-good font-semibold">{s.activity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border/40 pt-2 flex justify-between items-center text-xs">
        <a href="#" className="font-semibold text-primary hover:underline">
          View details
        </a>
      </div>
    </div>
  );
}
