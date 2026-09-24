import { useCallback, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { RecordingStep } from "@/components/onboarding/RecordingStep";
import { completeOnboarding, ONBOARDING_PREFS_KEY } from "@/lib/onboarding";
import type { RecordingPreferences } from "@/types/onboarding";

type OnboardingFlowProps = {
  onComplete: () => void;
  onBack?: () => void;
};

export const OnboardingFlow = ({ onComplete, onBack }: OnboardingFlowProps) => {
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [preferences, setPreferences] = useState<RecordingPreferences>({
    captures: ["desktop"],
    trackMode: "visible",
  });

  const handleComplete = useCallback((): void => {
    try {
      if (preferences.captures.length === 0) {
        setValidationMessage("Select at least one tracker.");
        return;
      }

      localStorage.setItem(ONBOARDING_PREFS_KEY, JSON.stringify(preferences));
      completeOnboarding();
      onComplete();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setValidationMessage("");
    }
  }, [onComplete, preferences]);

  const handlePreferencesChange = useCallback((next: RecordingPreferences): void => {
    setPreferences(next);
    setValidationMessage("");
  }, []);

  return (
    <OnboardingLayout
      step={4}
      totalSteps={4}
      title="Set up time tracking for your team"
      subtitle="Choose the trackers available to your team. You can select more than one."
      onBack={onBack}
      onComplete={handleComplete}
      completeLabel="Open your workspace"
    >
      <RecordingStep
        initial={preferences}
        onChange={handlePreferencesChange}
        onValidationError={setValidationMessage}
      />
      {validationMessage ? (
        <p className="mt-3 text-sm text-health-bad" role="alert">
          {validationMessage}
        </p>
      ) : null}
    </OnboardingLayout>
  );
};
