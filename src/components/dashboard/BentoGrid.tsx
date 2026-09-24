import { cn } from "@/lib/utils";
import type { WidgetDescriptor, WidgetSize } from "@/types";
import type { DemoPlan } from "@/types/plan";
import { WidgetRenderer } from "./WidgetRenderer";
import { HiddenWidgetCard } from "./WidgetShell";

/**
 * Responsive Bento grid on a 12-column track. Each widget locks into a
 * predefined column span + fixed row height so the layout tiles perfectly and
 * content never overflows (widgets scroll internally instead).
 */

const SPAN: Record<WidgetSize, string> = {
  quarter: "lg:col-span-3",
  third: "lg:col-span-4",
  "third-short": "lg:col-span-4",
  "half-short": "lg:col-span-6",
  half: "lg:col-span-6",
  "half-tall": "lg:col-span-6",
  "two-third": "lg:col-span-8",
  full: "lg:col-span-12",
  "full-tall": "lg:col-span-12",
  "full-short": "lg:col-span-12",
};

const HEIGHT: Record<WidgetSize, string> = {
  quarter: "min-h-[176px] lg:h-[176px]",
  third: "min-h-[300px] lg:h-[300px]",
  "third-short": "min-h-[190px] lg:h-[190px]",
  "half-short": "min-h-[176px] lg:h-[176px]",
  half: "min-h-[300px] lg:h-[300px]",
  "half-tall": "min-h-[430px] lg:h-[430px]",
  "two-third": "min-h-[300px] lg:h-[300px]",
  full: "min-h-[320px] lg:h-[320px]",
  "full-tall": "min-h-[300px] lg:h-[480px]",
  "full-short": "min-h-[176px] lg:h-[176px]",
};

/** Fixed height overrides for widgets that need a custom compact band. */
const HEIGHT_OVERRIDE: Record<string, string> = {
  "w-applications": "min-h-[232px] lg:h-[232px]",
  "w-websites": "min-h-[232px] lg:h-[232px]",
  "w-projects-worked": "min-h-[300px] lg:h-[300px]",
  "w-classification": "min-h-[232px] lg:h-[232px]",
  "w-tracked-least": "min-h-[192px] lg:h-[192px]",
  "w-time-log-approval": "min-h-[192px] lg:h-[192px]",
  "w-workload-capacity": "min-h-[232px] lg:h-[232px]",
  "w-members": "min-h-[248px] lg:h-[248px]",
  "w-upcoming-leaves": "min-h-[248px] lg:h-[248px]",
  "w-top-profit": "min-h-[248px] lg:h-[248px]",
  "w-cost": "min-h-[248px] lg:h-[248px]",
  "w-task-timeline": "min-h-[360px] lg:h-[380px]",
  "w-budget-health": "min-h-[360px] lg:h-[380px]",
};

/** Resize order for the grow / shrink controls. */
export const SIZE_ORDER: WidgetSize[] = [
  "quarter",
  "third-short",
  "third",
  "half-short",
  "half",
  "half-tall",
  "two-third",
  "full-short",
  "full",
  "full-tall",
];

export interface GridOps {
  onHide: (id: string) => void;
  onRestore: (id: string) => void;
  onResize: (id: string, dir: 1 | -1) => void;
  onMove: (id: string, dir: 1 | -1) => void;
}

export function BentoGrid({
  widgets,
  highlightId,
  editing,
  ops,
  onOpenReport,
  dateRange,
  plan,
}: {
  widgets: WidgetDescriptor[];
  highlightId?: string | null;
  editing?: boolean;
  ops?: GridOps;
  onOpenReport?: (reportKey?: string) => void;
  dateRange?: string;
  plan?: DemoPlan;
}) {
  const list = editing ? widgets : widgets.filter((w) => !w.hidden);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" role="list" aria-label="Dashboard widgets">
      {list.map((w) => (
        <div
          key={w.id}
          role="listitem"
          id={`widget-${w.id}`}
          className={cn(
            "scroll-mt-28",
            SPAN[w.size],
            HEIGHT_OVERRIDE[w.id] ?? HEIGHT[w.size],
            w.hidden && "lg:col-span-3 lg:h-[176px]",
          )}
        >
          {w.hidden ? (
            <HiddenWidgetCard title={w.title} onRestore={() => ops?.onRestore(w.id)} />
          ) : (
            <WidgetRenderer
              widget={w}
              highlight={highlightId === w.id}
              editing={editing}
              onOpenReport={onOpenReport}
              dateRange={dateRange}
              plan={plan}
              edit={
                ops && {
                  onHide: () => ops.onHide(w.id),
                  onGrow: () => ops.onResize(w.id, 1),
                  onShrink: () => ops.onResize(w.id, -1),
                  onMoveUp: () => ops.onMove(w.id, -1),
                  onMoveDown: () => ops.onMove(w.id, 1),
                }
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
