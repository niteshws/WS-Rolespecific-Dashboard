import { useCallback, useEffect, useState } from "react";
import { TOUR_STEPS, resolveTourStepContent, type TourStep, type TourStepContent } from "@/lib/tour";

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type GuidedTourProps = {
  active: boolean;
  stepIndex: number;
  onStepChange: (index: number) => void;
  onEnd: (completed: boolean) => void;
  onStepEnter?: (step: TourStep) => void;
};

const CARD_WIDTH = 340;
const CARD_ESTIMATED_HEIGHT = 190;
const HIGHLIGHT_PAD = 8;

export const GuidedTour = ({
  active,
  stepIndex,
  onStepChange,
  onEnd,
  onStepEnter,
}: GuidedTourProps) => {
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);

  const step: TourStep | undefined = TOUR_STEPS[stepIndex];

  useEffect(() => {
    if (active && stepIndex >= TOUR_STEPS.length) {
      onEnd(true);
    }
  }, [active, onEnd, stepIndex]);

  const updatePositions = useCallback((): void => {
    if (!active || !step) return;

    try {
      const target: HTMLElement | null = document.getElementById(step.targetId);
      if (!target) {
        if (stepIndex >= TOUR_STEPS.length - 1) {
          onEnd(true);
          return;
        }
        onStepChange(stepIndex + 1);
        return;
      }

      target.scrollIntoView({ block: "center", behavior: "auto" });
      window.requestAnimationFrame(() => {
        const rect: DOMRect = target.getBoundingClientRect();
        const nextSpotlight: SpotlightRect = {
          top: rect.top - HIGHLIGHT_PAD,
          left: rect.left - HIGHLIGHT_PAD,
          width: rect.width + HIGHLIGHT_PAD * 2,
          height: rect.height + HIGHLIGHT_PAD * 2,
        };
        setSpotlight(nextSpotlight);

        const cardTopBelow: number = rect.bottom + 14;
        const cardTopAbove: number = rect.top - CARD_ESTIMATED_HEIGHT - 14;
        const top: number =
          cardTopBelow + CARD_ESTIMATED_HEIGHT > window.innerHeight - 12
            ? Math.max(12, cardTopAbove)
            : cardTopBelow;
        const left: number = Math.min(
          Math.max(12, rect.left),
          window.innerWidth - CARD_WIDTH - 12,
        );
        setCardPos({ top, left });
      });
    } catch (error) {
      console.error("Failed to position guided tour step:", error);
    }
  }, [active, onEnd, onStepChange, step, stepIndex]);

  useEffect(() => {
    if (!active || !step) return;
    onStepEnter?.(step);
    updatePositions();
  }, [active, onStepEnter, step, updatePositions]);

  useEffect(() => {
    if (!active) return;

    const handleReposition = (): void => {
      updatePositions();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition);
    };
  }, [active, updatePositions]);

  const handleSkip = (): void => {
    try {
      onEnd(false);
    } catch (error) {
      console.error("Failed to skip tour:", error);
    }
  };

  const handleBack = (): void => {
    try {
      if (stepIndex > 0) onStepChange(stepIndex - 1);
    } catch (error) {
      console.error("Failed to go back in tour:", error);
    }
  };

  const handleNext = (): void => {
    try {
      if (stepIndex >= TOUR_STEPS.length - 1) {
        onEnd(true);
        return;
      }
      onStepChange(stepIndex + 1);
    } catch (error) {
      console.error("Failed to advance tour:", error);
    }
  };

  if (!active || !step || !spotlight || !cardPos) return null;

  const stepContent: TourStepContent = resolveTourStepContent(step);
  const isLastStep: boolean = stepIndex === TOUR_STEPS.length - 1;

  return (
    <>
      <div
        className="pointer-events-none fixed z-[200] rounded-[14px] border-2 border-[#8b6cff] shadow-[0_0_0_9999px_rgba(15,10,46,0.55),0_0_0_6px_rgba(139,108,255,0.28)] transition-all duration-300 ease-out"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
        }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        className="fixed z-[210] w-[min(340px,calc(100vw-32px))] rounded-xl border border-[#e5e7eb] bg-white p-[18px] shadow-[0_28px_80px_rgba(15,10,46,0.35)]"
        style={{ top: cardPos.top, left: cardPos.left }}
      >
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5d2bff]">
          Step {stepIndex + 1} of {TOUR_STEPS.length}
        </p>
        <h3 id="guided-tour-title" className="mb-1.5 text-[18px] font-semibold tracking-[-0.01em] text-ink">
          {stepContent.title}
        </h3>
        <p className="mb-3.5 text-[14px] leading-relaxed text-[#6b7280]">{stepContent.body}</p>

        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[13px] font-medium text-[#5d2bff] transition-colors hover:text-[#4d1fe0]"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-1.5">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-[#f9fafb]"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleNext}
              className="h-8 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#4d1fe0]"
            >
              {isLastStep ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
