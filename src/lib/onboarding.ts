export const ONBOARDING_COMPLETE_KEY = "ws-onboarding-complete";
export const ONBOARDING_PREFS_KEY = "ws-onboarding-recording-prefs";
export const FIRST_INSIGHT_SEEN_KEY = "ws-first-insight-seen";

export const isOnboardingComplete = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
};

export const resetOnboarding = (): void => {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    localStorage.removeItem(FIRST_INSIGHT_SEEN_KEY);
    localStorage.removeItem(ONBOARDING_PREFS_KEY);
  } catch (error) {
    console.error("Failed to reset onboarding:", error);
  }
};


export const completeOnboarding = (): void => {
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
  } catch (error) {
    console.error("Failed to mark onboarding complete:", error);
  }
};
