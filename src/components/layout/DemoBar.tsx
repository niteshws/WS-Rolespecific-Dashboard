import { cn } from "@/lib/utils";
import type { DemoPlan } from "@/types/plan";

type DemoBarProps = {
  plan: DemoPlan;
  onPlanChange: (plan: DemoPlan) => void;
};

const PLAN_OPTIONS: { id: DemoPlan; label: string }[] = [
  { id: "trial", label: "Trial" },
  { id: "proof", label: "Proof" },
  { id: "profit", label: "Profit" },
];

export const DemoBar = ({ plan, onPlanChange }: DemoBarProps) => {
  const handlePlanChange = (nextPlan: DemoPlan): void => {
    try {
      onPlanChange(nextPlan);
    } catch (error) {
      console.error("Failed to change demo plan:", error);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 rounded-full border border-white/10 bg-[#11032e] px-[18px] py-2 shadow-[0_8px_26px_rgba(15,10,46,0.3)]">
      <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#b9afd6]">
        Demo
      </span>
      <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#b9afd6]">
        Plan
      </span>
      <div className="flex rounded-lg bg-white/10 p-[3px]" role="group" aria-label="Plan">
        {PLAN_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={plan === option.id}
            onClick={() => handlePlanChange(option.id)}
            className={cn(
              "h-[30px] rounded-md px-[11px] text-[13px] font-medium transition-colors",
              plan === option.id
                ? "bg-primary text-white"
                : "bg-transparent text-[#cfc8e2] hover:text-white",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
