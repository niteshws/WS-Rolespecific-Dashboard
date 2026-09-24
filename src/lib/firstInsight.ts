import type { RecordingPreferences, TrackerId } from "@/types/onboarding";
import { FIRST_INSIGHT_SEEN_KEY, ONBOARDING_PREFS_KEY } from "@/lib/onboarding";

export const FIRST_INSIGHT_MESSAGE =
  "You're seeing sample data so you can explore the dashboard. Real numbers appear once your team installs the app and runs the tracker.";

const TRACKER_LABELS: Record<TrackerId, string> = {
  desktop: "Desktop tracker",
  mobile: "Mobile tracker",
  web: "Web timer",
};

export const getRecordingPreferences = (): RecordingPreferences | null => {
  try {
    const raw: string | null = localStorage.getItem(ONBOARDING_PREFS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RecordingPreferences;
  } catch {
    return null;
  }
};

export const hasSeenFirstInsight = (): boolean => {
  try {
    return localStorage.getItem(FIRST_INSIGHT_SEEN_KEY) === "true";
  } catch {
    return false;
  }
};

export const markFirstInsightSeen = (): void => {
  try {
    localStorage.setItem(FIRST_INSIGHT_SEEN_KEY, "true");
  } catch (error) {
    console.error("Failed to mark first insight as seen:", error);
  }
};

export const clearFirstInsightSeen = (): void => {
  try {
    localStorage.removeItem(FIRST_INSIGHT_SEEN_KEY);
  } catch (error) {
    console.error("Failed to clear first insight seen state:", error);
  }
};
