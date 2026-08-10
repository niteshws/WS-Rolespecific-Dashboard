import type { Dashboard } from "@/types";
import {
  makeAppBreakdown,
  categories,
  appsAffectingFocus,
  makeHeatmap,
  makeWorkloadBalance
} from "@/data/dummy";

const heatmap = makeHeatmap();
const workloadBalance = makeWorkloadBalance();

export const MY_DASHBOARD: Dashboard = {
  id: "my-dashboard",
  role: "My Dashboard",
  name: "My Dashboard",
  icon: "User",
  visibility: "private",
  description: "Your workday at a glance and personal analytics",
  owner: "Vinove Design",
  templateId: "my-dashboard",
  insights: [
    {
      id: "my-i1",
      severity: "good",
      title: "On Track",
      body: "6.2h logged · 78% of daily target · peak focus 10-11 AM · 82% activity (+4% above team avg).",
      action: "View Details"
    }
  ],
  kpis: [
    { id: "k-hours", label: "Hours Today", value: "6.2h", delta: 12, deltaLabel: "+0.8h vs yesterday", deltaPolarity: "up-good", health: "good", sparkline: [40, 50, 45, 55, 60, 62], reportKey: "timesheet", icon: "Clock" },
    { id: "k-activity", label: "Activity Score", value: "82%", delta: 4, deltaLabel: "+4% vs team avg 78%", deltaPolarity: "up-good", health: "good", sparkline: [75, 78, 80, 81, 82], reportKey: "productivity", icon: "Activity" },
    { id: "k-focus", label: "Focus Time", value: "4.1h", delta: 10, deltaLabel: "Peak 10-11 AM", deltaPolarity: "up-good", health: "good", sparkline: [30, 35, 40, 38, 41], reportKey: "focus", icon: "Zap" },
    { id: "k-tasks", label: "Tasks Due Today", value: "3", delta: 1, deltaLabel: "1 overdue · 2 remaining", deltaPolarity: "up-bad", health: "warn", sparkline: [5, 4, 3], reportKey: "tasks", icon: "CheckSquare" },
  ],
  widgets: [
    {
      id: "w-my-allocation",
      type: "myAllocation",
      size: "third-short",
      title: "My Allocation",
      layer: 2,
    },
    {
      id: "w-timeline",
      type: "peakFocus",
      size: "third-short",
      title: "Peak focus hours",
      layer: 2,
    },
    {
      id: "w-leave-balance",
      type: "leaveBalance",
      size: "third-short",
      title: "Leave Balance",
      layer: 2,
    },
    {
      id: "w-screenshots",
      type: "screenshots",
      size: "half",
      title: "Recent Screenshots",
      subtitle: "Captured desktop screenshot logs",
      reportKey: "screenshots",
      layer: 2,
    },
    {
      id: "w-recent-tasks",
      type: "recentTasks",
      size: "half",
      title: "Recent Tasks",
      subtitle: "Assigned tasks status",
      reportKey: "tasks",
      layer: 2,
    },
    {
      id: "w-total-tasks-donut",
      type: "donut",
      size: "half",
      title: "Total Tasks",
      subtitle: "Status breakdown",
      reportKey: "tasks",
      payload: {
        slices: [
          { key: "Not Started", value: 15, color: "#374151" },
          { key: "Active", value: 9, color: "#0ea5e9" },
          { key: "Done", value: 0, color: "#10b981" },
          { key: "Closed", value: 30, color: "#9ca3af" }
        ],
        centerValue: "54",
        centerLabel: "Total Tasks"
      },
      layer: 2,
    },
    {
      id: "w-focus-apps-urls",
      type: "barList",
      size: "half",
      title: "Apps & URLs Affecting Focus",
      subtitle: "Allocation % · sized by attention shifts",
      reportKey: "apps",
      payload: { items: appsAffectingFocus, unit: "Allocation%", bubbles: true, bubbleLegend: "Attention shifts" },
      layer: 2,
    },
    {
      id: "w-apps-prod",
      type: "appBreakdown",
      size: "third",
      title: "Productive Apps/URLs",
      reportKey: "apps",
      payload: makeAppBreakdown("Productive"),
      layer: 2,
    },
    {
      id: "w-apps-neutral",
      type: "appBreakdown",
      size: "third",
      title: "Neutral Apps/URLs",
      reportKey: "apps",
      payload: makeAppBreakdown("Neutral"),
      layer: 2,
    },
    {
      id: "w-apps-unprod",
      type: "appBreakdown",
      size: "third",
      title: "Unproductive Apps/URLs",
      reportKey: "apps",
      payload: makeAppBreakdown("Distracting"),
      layer: 2,
    },
    {
      id: "w-categories",
      type: "categoriesBar",
      size: "full-short",
      title: "Categories",
      subtitle: "Apps & URLs",
      reportKey: "apps",
      payload: categories,
      layer: 2,
    },
    {
      id: "w-heatmap",
      type: "heatmap",
      size: "half",
      title: "Login Activity",
      subtitle: "Access intensity by day and hour",
      reportKey: "members",
      payload: heatmap,
      layer: 2,
    },
    {
      id: "w-workload",
      type: "miniTable",
      size: "half",
      title: "Workload Balance",
      subtitle: "Workload analysis",
      reportKey: "workload",
      payload: {
        columns: workloadBalance.columns.map(col => col.key === "team" ? { ...col, label: "Member" } : col),
        rows: [
          { team: "Vinove Design Team", over: 74, under: 6, breaks: 3.8, mins: 4.2 }
        ]
      },
      layer: 2,
    },
    {
      id: "w-recent-timesheet",
      type: "dataTable",
      size: "full",
      title: "Recent Timesheets",
      subtitle: "Timesheet logs for projects and tasks",
      payload: {
        columns: [
          { key: "project", label: "Project", pinned: true, width: 200 },
          { key: "task", label: "Task", width: 200 },
          { key: "date", label: "Date", width: 110 },
          { key: "start", label: "Start Time", width: 100 },
          { key: "stop", label: "End Time", width: 100 },
          { key: "duration", label: "Duration", align: "right", width: 100 }
        ],
        rows: [
          { project: "Fintech Dashboard v2", task: "Implement date range filter", date: "18 Jun, 2026", start: "09:15 AM", stop: "10:02 AM", duration: "00:47:12" },
          { project: "Fintech Dashboard v2", task: "Aesthetic styling updates", date: "18 Jun, 2026", start: "10:30 AM", stop: "—", duration: "Tracking..." },
        ]
      },
      layer: 2,
      reportKey: "timesheet",
    }
  ]
};
