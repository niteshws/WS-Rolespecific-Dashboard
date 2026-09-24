import { Sparkles } from "lucide-react";

type TourCalloutStripProps = {
  highlighted?: boolean;
  onStartTour: () => void;
  onDismiss: () => void;
};

export const TourCalloutStrip = ({ highlighted = false, onStartTour, onDismiss }: TourCalloutStripProps) => {
  const handleStartTour = (): void => {
    try {
      onStartTour();
    } catch (error) {
      console.error("Failed to start tour:", error);
    }
  };

  const handleDismiss = (): void => {
    try {
      onDismiss();
    } catch (error) {
      console.error("Failed to dismiss tour callout:", error);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-[10px] border bg-[#f5f0ff] px-[15px] py-[11px] text-[14px] text-[#4b4360] ${
        highlighted
          ? "animate-pulse border-2 border-[#5d2bff] shadow-[0_8px_24px_rgba(93,43,255,0.12)]"
          : "border border-[rgba(93,43,255,0.3)]"
      }`}
    >
      <Sparkles className="h-4 w-4 shrink-0 text-[#5d2bff]" strokeWidth={1.75} aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-snug">
        <span className="font-semibold text-[#4b4360]">New here?</span>{" "}
        In about a minute, we&apos;ll walk you through setup, tracking, and the numbers that matter.
      </p>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={handleStartTour}
          className="h-8 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#4d1fe0]"
        >
          Take the tour
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[13px] font-medium text-[#5d2bff] transition-colors hover:text-[#4d1fe0]"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
