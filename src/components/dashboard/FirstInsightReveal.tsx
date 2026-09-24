import { FIRST_INSIGHT_MESSAGE, markFirstInsightSeen } from "@/lib/firstInsight";

type FirstInsightRevealProps = {
  open: boolean;
  onClose: () => void;
  onShowMe: () => void;
};

export const FirstInsightReveal = ({ open, onClose, onShowMe }: FirstInsightRevealProps) => {
  const handleDismiss = (): void => {
    try {
      markFirstInsightSeen();
      onClose();
    } catch (error) {
      console.error("Failed to dismiss first insight reveal:", error);
    }
  };

  const handleShowMe = (): void => {
    try {
      markFirstInsightSeen();
      onShowMe();
      onClose();
    } catch (error) {
      console.error("Failed to open dashboard:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close setup message"
        className="absolute inset-0 bg-[rgba(15,10,46,0.66)] backdrop-blur-[6px]"
        onClick={handleDismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-insight-title"
        className="relative z-[101] w-full max-w-[440px] rounded-2xl border border-white/10 bg-white p-8 text-center shadow-[0_40px_120px_rgba(15,10,46,0.45)]"
      >
        <p className="mb-2 flex justify-center text-[11px] font-bold uppercase tracking-[0.08em] text-[#5d2bff]">
          While you were setting up
        </p>
        <h2
          id="first-insight-title"
          className="mb-4 text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink"
        >
          Your dashboard is ready
        </h2>
        <p className="mb-8 text-[14px] leading-relaxed text-[#6b7280]">{FIRST_INSIGHT_MESSAGE}</p>

        <button
          type="button"
          onClick={handleShowMe}
          className="h-10 w-full rounded-lg bg-primary text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(93,43,255,0.22)] transition-colors hover:bg-[#4d1fe0]"
        >
          Explore dashboard
        </button>
      </div>
    </div>
  );
};
