import { MY_DASHBOARD } from "@/data/myDashboard";
import type { Dashboard } from "@/types";
import type { RecordingPreferences, TrackerId } from "@/types/onboarding";
import { FIRST_INSIGHT_SEEN_KEY, ONBOARDING_PREFS_KEY } from "@/lib/onboarding";

export type FirstInsightStat = {
  value: string;
  label: string;
  sublabel?: string;
  valueClassName?: string;
};

export type FirstInsightContent = {
  subtitle: string;
  stats: [FirstInsightStat, FirstInsightStat, FirstInsightStat];
  footerNote: string;
  isSample: boolean;
};

const SAMPLE_SESSION_MINUTES = 18;
const SAMPLE_REVENUE_INR = 232440;
const MY_DASHBOARD_PROJECT = "Fintech Dashboard v2";

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

const buildTrackerSummary = (prefs: RecordingPreferences | null): string => {
  if (!prefs?.captures?.length) return "your trackers";

  const labels: string[] = prefs.captures.map((id) => TRACKER_LABELS[id]);
  const modeNote: string =
    prefs.captures.includes("desktop") && prefs.trackMode === "silent"
      ? " (Silent Desktop)"
      : "";

  return `${labels.join(" + ")}${modeNote}`;
};

const buildMyDashboardInsight = (trackerSummary: string): FirstInsightContent => {
  const tasksDueKpi = MY_DASHBOARD.kpis.find((kpi) => kpi.id === "k-tasks");
  const activityKpi = MY_DASHBOARD.kpis.find((kpi) => kpi.id === "k-activity");
  const workdayItems: number = Number.parseInt(tasksDueKpi?.value ?? "3", 10) || 3;
  const activityValue: string = activityKpi?.value ?? "82%";

  return {
    subtitle: `While you finished setup, Workstatus captured a clearly-labelled sample session on ${MY_DASHBOARD_PROJECT} — time, project and activity context, reviewable now with ${trackerSummary} enabled.`,
    stats: [
      {
        value: String(SAMPLE_SESSION_MINUTES),
        label: "min sample session",
        sublabel: MY_DASHBOARD_PROJECT,
      },
      {
        value: String(workdayItems),
        label: "workday items",
        sublabel: "worth acting on",
      },
      {
        value: activityValue,
        label: "activity today",
        valueClassName: "text-health-good",
      },
    ],
    footerNote:
      "Sample workspace, honestly labelled — your real numbers replace these as you track.",
    isSample: true,
  };
};

const buildExecutiveInsight = (dashboard: Dashboard, trackerSummary: string): FirstInsightContent => {
  const signalCount: number = Math.max(dashboard.insights.length, 4);
  const dashboardName: string = dashboard.name ?? dashboard.role;

  return {
    subtitle: `While you finished setup, Workstatus captured a clearly-labelled sample session on ${dashboardName} — time, project and activity context, reviewable now with ${trackerSummary} enabled.`,
    stats: [
      {
        value: String(SAMPLE_SESSION_MINUTES),
        label: "min sample session",
        sublabel: dashboardName,
      },
      {
        value: String(signalCount),
        label: "signals",
        sublabel: "worth acting on",
      },
      {
        value: `₹${SAMPLE_REVENUE_INR.toLocaleString("en-IN")}`,
        label: "revenue at risk",
        sublabel: "recoverable this week",
        valueClassName: "text-[#991b1b]",
      },
    ],
    footerNote:
      "Sample workspace, honestly labelled — your numbers replace these as your team tracks.",
    isSample: true,
  };
};

export const buildFirstInsightContent = (dashboard: Dashboard): FirstInsightContent => {
  const prefs: RecordingPreferences | null = getRecordingPreferences();
  const trackerSummary: string = buildTrackerSummary(prefs);

  if (dashboard.id === "my-dashboard") {
    return buildMyDashboardInsight(trackerSummary);
  }

  return buildExecutiveInsight(dashboard, trackerSummary);
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
