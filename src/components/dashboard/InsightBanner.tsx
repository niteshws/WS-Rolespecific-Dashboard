import { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/types";

const CONFIG = {
  good: {
    icon: CheckCircle2,
    ring: "border-health-good/30 bg-health-good/[0.06]",
    iconColor: "text-health-good",
    emoji: "✅",
  },
  warn: {
    icon: AlertTriangle,
    ring: "border-health-warn/30 bg-health-warn/[0.07]",
    iconColor: "text-[#b45309]",
    emoji: "⚠️",
  },
  bad: {
    icon: AlertTriangle,
    ring: "border-health-bad/30 bg-health-bad/[0.06]",
    iconColor: "text-health-bad",
    emoji: "🚨",
  },
} as const;

/**
 * Data storytelling — translates anomalies into natural-language guidance.
 * Renders a prioritized rail of dismissible insight cards.
 */
export function InsightBanner({
  insights,
  onOpenReport,
}: {
  insights: Insight[];
  onOpenReport?: (reportKey?: string) => void;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = insights.filter((i) => !dismissed.has(i.id));

  if (visible.length === 0) return null;

  return (
    <section aria-label="Automated insights" className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Intelligence Insights
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {visible.length} new
        </span>
      </div>
      <div className={cn("grid gap-2", visible.length === 1 ? "grid-cols-1" : "md:grid-cols-2")}>
        {visible.map((ins) => {
          const c = CONFIG[ins.severity];
          const IconCmp = c.icon;
          return (
            <div
              key={ins.id}
              role="status"
              className={cn(
                "animate-fade-in flex items-start gap-3 rounded border p-3",
                c.ring,
              )}
            >
              <IconCmp className={cn("mt-0.5 h-4 w-4 shrink-0", c.iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-tight text-ink">{ins.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{ins.body}</p>
                {ins.action && (
                  <button
                    onClick={() => onOpenReport?.(ins.reportKey)}
                    className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline"
                  >
                    {ins.action}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setDismissed((s) => new Set(s).add(ins.id))}
                aria-label={`Dismiss insight: ${ins.title}`}
                className="rounded p-0.5 text-muted-foreground hover:bg-black/5 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
