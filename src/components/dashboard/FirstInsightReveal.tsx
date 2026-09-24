import { useEffect, useState } from "react";
import { buildFirstInsightContent, markFirstInsightSeen, type FirstInsightContent } from "@/lib/firstInsight";
import type { Dashboard } from "@/types";

type FirstInsightRevealProps = {
  open: boolean;
  dashboard: Dashboard;
  onClose: () => void;
  onShowMe: () => void;
};

export const FirstInsightReveal = ({
  open,
  dashboard,
  onClose,
  onShowMe,
}: FirstInsightRevealProps) => {
  const [content, setContent] = useState<FirstInsightContent | null>(null);

  useEffect(() => {
    if (!open) return;
    setContent(buildFirstInsightContent(dashboard));
  }, [open, dashboard]);

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
      console.error("Failed to open first insight:", error);
    }
  };

  const handleEmailLater = (): void => {
    try {
      markFirstInsightSeen();
      onClose();
    } catch (error) {
      console.error("Failed to schedule insight email:", error);
    }
  };

  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close first insight reveal"
        className="absolute inset-0 bg-[rgba(15,10,46,0.66)] backdrop-blur-[6px]"
        onClick={handleDismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-insight-title"
        className="relative z-[101] w-full max-w-[560px] rounded-2xl border border-white/10 bg-white p-8 text-center shadow-[0_40px_120px_rgba(15,10,46,0.45)]"
      >
        <p className="mb-2 flex justify-center text-[11px] font-bold uppercase tracking-[0.08em] text-[#5d2bff]">
          While you were setting up
        </p>
        <h2
          id="first-insight-title"
          className="mb-3 text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink"
        >
          Your first insight is ready
        </h2>
        <p className="mb-6 text-[14px] leading-relaxed text-[#6b7280]">{content.subtitle}</p>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-stretch">
          {content.stats.map((stat) => (
            <RevealFact
              key={`${stat.label}-${stat.sublabel ?? ""}`}
              value={stat.value}
              label={stat.label}
              sublabel={stat.sublabel}
              valueClassName={stat.valueClassName}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleShowMe}
          className="h-10 w-full rounded-lg bg-primary text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(93,43,255,0.22)] transition-colors hover:bg-[#4d1fe0]"
        >
          Show me
        </button>
        <button
          type="button"
          onClick={handleEmailLater}
          className="mt-2 w-full py-2 text-[13px] font-medium text-[#5d2bff] transition-colors hover:text-[#4d1fe0]"
        >
          Or email me this first insight to read later
        </button>
        <p className="mt-4 text-center text-[12px] leading-relaxed text-[#9ca3af]">
          {content.footerNote}
        </p>
      </div>
    </div>
  );
};

const RevealFact = ({
  value,
  label,
  sublabel,
  valueClassName = "text-ink",
}: {
  value: string;
  label: string;
  sublabel?: string;
  valueClassName?: string;
}) => (
  <div className="flex h-full min-h-[96px] flex-col items-center rounded-xl border border-[#eef0f4] bg-[#fafafa] px-3 py-3 text-center">
    <b
      className={`flex min-h-[26px] items-center justify-center text-[20px] font-bold leading-none tracking-tight ${valueClassName}`}
    >
      {value}
    </b>
    <div className="mt-2 flex min-h-[38px] flex-1 flex-col items-center justify-center gap-0.5">
      <span className="text-balance text-[12px] font-medium leading-snug text-[#6b7280]">{label}</span>
      <span
        className={`text-balance text-[11px] leading-snug ${sublabel?.trim() ? "text-[#9ca3af]" : "invisible"}`}
        aria-hidden={!sublabel?.trim()}
      >
        {sublabel?.trim() || "\u00A0"}
      </span>
    </div>
  </div>
);
