import { getRecordingPreferences } from "@/lib/firstInsight";
import type { RecordingPreferences, TrackerId } from "@/types/onboarding";

export const TOUR_CALLOUT_DISMISSED_KEY = "ws-tour-callout-dismissed";
export const TOUR_COMPLETE_KEY = "ws-tour-complete";

export type TourStep = {
  id: string;
  targetId: string;
  title: string;
  body: string;
};

export type TourStepContent = {
  title: string;
  body: string;
};

const TRACKER_START_HINTS: Record<TrackerId, string> = {
  desktop: "Launch the Desktop app and start tracking",
  mobile: "Open the Mobile app and clock in",
  web: "Start the Web timer on your current task",
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "invite-member",
    targetId: "navbar-create-btn",
    title: "Invite your team first",
    body: "Click the + button and choose New Member to invite teammates — tracking and insights get better with every person added.",
  },
  {
    id: "workday-banner",
    targetId: "my-dashboard-banner",
    title: "Start your tracker — watch your timeline",
    body: "Start your tracker and this view updates live — focus blocks, breaks, and idle gaps plotted against your daily target. Check back here to see where your hours went.",
  },
  {
    id: "insights",
    targetId: "insight-banner",
    title: "Insights worth acting on",
    body: "Workstatus surfaces the signals that matter — ranked by impact, with a direct path to dig deeper.",
  },
  {
    id: "kpis",
    targetId: "dashboard-kpis",
    title: "Key metrics at a glance",
    body: "Hours, activity, focus, and tasks due — the numbers you check first, updated as your team tracks.",
  },
  {
    id: "dashboards",
    targetId: "sidebar-intelligence",
    title: "Role-based dashboards",
    body: "Switch between personal and team views — each dashboard answers a different question for your role.",
  },
  {
    id: "date-filter",
    targetId: "dashboard-date-filter",
    title: "Filter by time",
    body: "Switch between today, this week, or a custom range — every metric and widget updates to match.",
  },
];

const buildTrackerStartHint = (prefs: RecordingPreferences | null): string => {
  if (!prefs?.captures?.length) return "Start your tracker";

  const primaryTracker: TrackerId = prefs.captures.includes("desktop")
    ? "desktop"
    : prefs.captures.includes("mobile")
      ? "mobile"
      : prefs.captures[0];

  return TRACKER_START_HINTS[primaryTracker];
};

const buildWorkdayStepContent = (): TourStepContent => {
  const prefs: RecordingPreferences | null = getRecordingPreferences();
  const startHint: string = buildTrackerStartHint(prefs);
  const manualNote: string =
    prefs?.captures?.includes("web") && !prefs.captures.includes("desktop")
      ? " Use Log time to add entries manually anytime."
      : " Need a manual entry? Hit Log time above.";

  return {
    title: "Start your tracker — watch your timeline",
    body: `${startHint}, and this timeline fills in live — every focus block, break, and idle gap mapped to your daily target. Come back here anytime to see exactly where your hours went.${manualNote}`,
  };
};

export const resolveTourStepContent = (step: TourStep): TourStepContent => {
  if (step.id === "workday-banner") return buildWorkdayStepContent();
  return { title: step.title, body: step.body };
};

export const isTourCalloutDismissed = (): boolean => {
  try {
    return localStorage.getItem(TOUR_CALLOUT_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
};

export const dismissTourCallout = (): void => {
  try {
    localStorage.setItem(TOUR_CALLOUT_DISMISSED_KEY, "true");
  } catch (error) {
    console.error("Failed to dismiss tour callout:", error);
  }
};

export const isTourComplete = (): boolean => {
  try {
    return localStorage.getItem(TOUR_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
};

export const markTourComplete = (): void => {
  try {
    localStorage.setItem(TOUR_COMPLETE_KEY, "true");
  } catch (error) {
    console.error("Failed to mark tour complete:", error);
  }
};

export const clearTourState = (): void => {
  try {
    localStorage.removeItem(TOUR_CALLOUT_DISMISSED_KEY);
    localStorage.removeItem(TOUR_COMPLETE_KEY);
  } catch (error) {
    console.error("Failed to clear tour state:", error);
  }
};
