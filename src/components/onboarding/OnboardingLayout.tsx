import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { resetOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type OnboardingLayoutProps = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: () => void;
  onComplete: () => void;
  completeLabel?: string;
  showBack?: boolean;
};

export const OnboardingLayout = ({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onComplete,
  completeLabel = "Open your workspace",
  showBack = true,
}: OnboardingLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-8">
        <div className="flex items-center gap-2.5">
          <span
            className="h-[31px] w-[31px] shrink-0 rounded-[10px] shadow-[0_7px_19px_rgba(93,43,255,0.25)]"
            style={{
              background:
                "linear-gradient(135deg, #B7A7FF 0 43%, #fff 44% 58%, #5d2bff 59%)",
            }}
            aria-hidden="true"
          />
          <span className="text-xl font-semibold tracking-tight text-[#1a1247]">workstatus</span>
        </div>
        <button
          type="button"
          className="text-[13px] font-medium text-muted-foreground hover:text-ink"
          onClick={() => {
            resetOnboarding();
            window.location.reload();
          }}
        >
          Logout
        </button>
      </header>

      <div className="flex min-h-[calc(100vh-64px)] flex-1 flex-col justify-center">
        <main className="mx-auto flex w-full max-w-[720px] flex-col px-6 py-7">
          <div className="mb-3">
            <div className="flex gap-1.5" role="tablist" aria-label="Setup steps">
              {Array.from({ length: totalSteps }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-[5px] flex-1 rounded-full transition-colors",
                    index <= step - 1 ? "bg-[#8b6cff]" : "bg-[#eef0f4]",
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Step {step} of {totalSteps}
            </p>
          </div>

          <h1 className="mb-1 text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
            {title}
          </h1>
          <p className="mb-3.5 max-w-[52ch] text-[13px] leading-snug text-muted-foreground">
            {subtitle}
          </p>

          <div className="flex-1">{children}</div>

          <div className="sticky bottom-0 mt-3.5 flex items-center justify-between gap-3.5 border-t border-border bg-gradient-to-b from-white/0 via-white/70 to-white pt-3.5">
            {showBack ? (
              <button
                type="button"
                className="inline-flex h-[27px] min-h-[27px] items-center gap-1.5 rounded-md border border-[#5d2bff] bg-white px-3 text-xs font-medium text-[#5d2bff] transition-colors hover:border-primary hover:bg-[#f3efff]"
                onClick={onBack}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="inline-flex h-[27px] min-h-[27px] items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-medium text-white shadow-[0_6px_16px_rgba(93,43,255,0.18)] transition-colors hover:bg-[#4d1fe0]"
              onClick={onComplete}
            >
              {completeLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
