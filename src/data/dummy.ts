import type {
  ScatterPoint,
  HeatCell,
  LeaderRow,
  AppRow,
  HealthLevel,
  DataTablePayload,
  BarListItem,
  DonutSlice,
  DonutPayload,
  CategoriesPayload,
  MembersPayload,
  AxisChartPayload,
  TableRow,
  ProjectsWorkedPayload,
  TaskTimelineSummaryPayload,
  TopContributorsPayload,
  BudgetTrendPayload,
  BudgetTrendPeriod,
  ProjectBudgetHealthPayload,
  UpcomingLeavesPayload,
  BarListPayload,
} from "@/types";
import { PROJECT_STATUS_COLORS } from "@/lib/status";

/* -------------------------------------------------------------------------- */
/*  Deterministic pseudo-random helpers (stable across renders)               */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260807);
const between = (min: number, max: number) => min + rand() * (max - min);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const round1 = (n: number) => Math.round(n * 10) / 10;

function formatAmPm(hour: number, min: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;
}

/* -------------------------------------------------------------------------- */
/*  Realistic entities                                                         */
/* -------------------------------------------------------------------------- */

export const PEOPLE = [
  { name: "Abhishek Sharma", team: "Engineering", role: "Sr. Backend Engineer" },
  { name: "Abhaya Rawat", team: "Engineering", role: "Staff Engineer" },
  { name: "Sanya Mittal", team: "Engineering", role: "Frontend Engineer" },
  { name: "Hemant Kumar Bhatt", team: "Engineering", role: "DevOps Engineer" },
  { name: "Purna Chandra", team: "Design", role: "Product Designer" },
  { name: "Priya Negi", team: "Design", role: "Design Lead" },
  { name: "Chandrawati Singh", team: "Design", role: "UX Researcher" },
  { name: "Harsh Singh", team: "Product", role: "Sr. Product Manager" },
  { name: "Kiran Kumari Sharma", team: "Product", role: "Product Manager" },
  { name: "Ankit Kamal", team: "Sales", role: "Account Executive" },
  { name: "Aarti Yadav", team: "Sales", role: "SDR" },
  { name: "Akshay Tyagi", team: "Marketing", role: "Growth Marketer" },
  { name: "Amar Sharma", team: "Marketing", role: "Content Strategist" },
  { name: "Animesh Rai", team: "Support", role: "Support Lead" },
  { name: "Ashish Yadav", team: "Support", role: "Support Specialist" },
  { name: "Tripti Garg", team: "Finance", role: "Financial Analyst" },
];

export const TEAMS = ["Engineering", "Design", "Product", "Sales", "Marketing", "Support"];

export const APPS = [
  { app: "app.workstatus.io", category: "Productive" as const, color: "#0ea5e9" },
  { app: "Figma", category: "Productive" as const, color: "#a259ff" },
  { app: "Cursor", category: "Productive" as const, color: "#111111" },
  { app: "docs.google.com", category: "Productive" as const, color: "#4285f4" },
  { app: "Jira", category: "Productive" as const, color: "#0052cc" },
  { app: "chatgpt.com", category: "Neutral" as const, color: "#10a37f" },
  { app: "Slack", category: "Neutral" as const, color: "#611f69" },
  { app: "Gmail", category: "Neutral" as const, color: "#ea4335" },
  { app: "linkedin.com", category: "Neutral" as const, color: "#0a66c2" },
  { app: "Notepad", category: "Distracting" as const, color: "#6b7280" },
  { app: "YouTube", category: "Distracting" as const, color: "#ff0000" },
  { app: "instagram.com", category: "Distracting" as const, color: "#e1306c" },
];

/* -------------------------------------------------------------------------- */
/*  Simple series / chart generators                                           */
/* -------------------------------------------------------------------------- */

export function makeSparkline(len = 14, base = 50, volatility = 12): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < len; i++) {
    v += between(-volatility, volatility);
    v = Math.max(5, Math.min(100, v));
    out.push(Math.round(v));
  }
  return out;
}

function healthFrom(v: number, good = 75, warn = 55): HealthLevel {
  if (v >= good) return "good";
  if (v >= warn) return "warn";
  return "bad";
}

export function makeScatter(): ScatterPoint[] {
  return PEOPLE.map((p, i) => {
    const x = Math.round(between(28, 46));
    const y = Math.round(between(48, 94));
    return {
      id: `sp-${i}`,
      name: p.name,
      x,
      y,
      size: Math.round(between(6, 20)),
      health: healthFrom(y),
      team: p.team,
    };
  });
}

/** Shared scatter points for Velocity vs. Capacity widget + drawer. */
export const velocityCapacityScatter: ScatterPoint[] = makeScatter();

const scatterLoadBand = (hours: number): string => {
  if (hours >= 42) return "High load";
  if (hours >= 34) return "Balanced";
  return "Light load";
};

const scatterHealthLabel = (h: ScatterPoint["health"]): string =>
  h === "good" ? "Healthy" : h === "warn" ? "Watch" : "At risk";

/** Itemized member capacity vs productivity for the drawer. */
export function makeVelocityCapacityTable(): DataTablePayload {
  const points = [...velocityCapacityScatter].sort((a, b) => b.y - a.y || b.x - a.x);
  return {
    columns: [
      { key: "name", label: "Member", render: "avatar", pinned: true, width: 180 },
      { key: "team", label: "Team", width: 120 },
      { key: "hours", label: "Hours Tracked", width: 120 },
      { key: "productivity", label: "Productivity", render: "bar", width: 140 },
      { key: "band", label: "Band", render: "status", width: 130 },
    ],
    rows: points.map((p) => ({
      name: p.name,
      team: p.team,
      hours: `${p.x}h`,
      productivity: p.y,
      band: scatterLoadBand(p.x),
    })),
  };
}

/** Aggregates for the Velocity vs. Capacity report header. */
export function getVelocityCapacityReportMeta(): {
  members: number;
  avgHours: number;
  avgProductivity: number;
  healthy: number;
  watch: number;
  atRisk: number;
  highLoadAtRisk: number;
  narrative: string;
} {
  const points = velocityCapacityScatter;
  const members = points.length;
  const avgHours = Math.round(points.reduce((s, p) => s + p.x, 0) / Math.max(members, 1));
  const avgProductivity = Math.round(points.reduce((s, p) => s + p.y, 0) / Math.max(members, 1));
  const healthy = points.filter((p) => p.health === "good").length;
  const watch = points.filter((p) => p.health === "warn").length;
  const atRisk = points.filter((p) => p.health === "bad").length;
  const highLoadAtRisk = points.filter((p) => p.health === "bad" && p.x >= 40).length;
  const worst = [...points].filter((p) => p.health === "bad").sort((a, b) => a.y - b.y)[0];

  return {
    members,
    avgHours,
    avgProductivity,
    healthy,
    watch,
    atRisk,
    highLoadAtRisk,
    narrative:
      `${members} members plotted on hours tracked vs productivity — avg ${avgHours}h at ${avgProductivity}% productive. ` +
      `${healthy} healthy, ${watch} on watch, ${atRisk} at risk` +
      (highLoadAtRisk > 0
        ? `; ${highLoadAtRisk} are high-load and low-output — capacity without throughput.`
        : ".") +
      (worst
        ? ` Start with ${worst.name} (${worst.x}h · ${worst.y}%) for a coaching check-in.`
        : ""),
  };
}

/**
 * Drawer chart — avg hours (bars) + avg productivity (line) by team.
 * Complements the widget scatter; fixed team buckets stay readable at large N.
 */
export const velocityCapacityByTeam: AxisChartPayload = (() => {
  const byTeam = new Map<string, { hours: number; prod: number; n: number }>();
  for (const p of velocityCapacityScatter) {
    const cur = byTeam.get(p.team) ?? { hours: 0, prod: 0, n: 0 };
    cur.hours += p.x;
    cur.prod += p.y;
    cur.n += 1;
    byTeam.set(p.team, cur);
  }
  const teams = [...byTeam.entries()]
    .map(([team, v]) => ({
      team,
      avgHours: Math.round(v.hours / Math.max(v.n, 1)),
      avgProd: Math.round(v.prod / Math.max(v.n, 1)),
    }))
    .sort((a, b) => b.avgHours - a.avgHours);

  return {
    xLabels: teams.map((t) => t.team),
    unit: "hrs / %",
    series: [
      {
        key: "Avg hours",
        color: "#0ea5e9",
        kind: "bar",
        data: teams.map((t) => t.avgHours),
      },
      {
        key: "Avg productivity %",
        color: "#10b981",
        kind: "line",
        data: teams.map((t) => t.avgProd),
      },
    ],
  };
})();

export function makeHeatmap(): HeatCell[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const cells: HeatCell[] = [];
  for (const day of days) {
    for (let hour = 8; hour <= 19; hour++) {
      const morning = Math.exp(-Math.pow(hour - 10.5, 2) / 6);
      const afternoon = Math.exp(-Math.pow(hour - 15.5, 2) / 7);
      const lunchDip = hour === 13 ? 0.4 : 1;
      let v = (morning + afternoon) * 55 * lunchDip + between(-8, 8);
      if (day === "Fri") v *= 0.82;
      cells.push({ day, hour, value: Math.max(0, Math.min(100, Math.round(v))) });
    }
  }
  return cells;
}

export function makeLeaderboard(unit = "hrs"): LeaderRow[] {
  return PEOPLE.slice(0, 8)
    .map((p, i) => {
      const metric = round1(between(30, 48));
      return {
        id: `lb-${i}`,
        name: p.name,
        team: p.team,
        metric,
        unit,
        health: healthFrom(metric, 42, 36),
      };
    })
    .sort((a, b) => b.metric - a.metric);
}

/** Top Contributors — hours this month with share % and insight footer. */
export function makeTopContributors(): TopContributorsPayload {
  const raw = [
    { name: "Tamanna Chauhan", team: "Engineering", hours: 15, mins: 0 },
    { name: "Pallavi Singh", team: "Design", hours: 15, mins: 0 },
    { name: "Sanjana Pandey", team: "Product", hours: 14, mins: 48 },
    { name: "Neha Keshri", team: "Engineering", hours: 13, mins: 12 },
    { name: "Sunayana Pilania", team: "Design", hours: 7, mins: 24 },
    { name: "Saurabh Pathak", team: "Engineering", hours: 7, mins: 18 },
  ];
  const metrics = raw.map((r) => round1(r.hours + r.mins / 60));
  const total = metrics.reduce((s, n) => s + n, 0);
  const rows: LeaderRow[] = raw.map((r, i) => {
    const metric = metrics[i];
    const percent = Math.round((metric / total) * 100);
    return {
      id: `tc-${i}`,
      name: r.name,
      team: r.team,
      metric,
      unit: "h",
      hoursLabel: `${r.hours}h ${r.mins}m`,
      percent,
      health: i < 2 ? "good" : "warn",
    };
  });
  const top = rows[0];
  const second = rows[1];
  return {
    periodLabel: "This Month",
    rows,
    insight: `${top.name} and ${second.name} are the top contributors with ${top.hoursLabel} each (${top.percent}%).`,
  };
}

export const topContributorsPayload = makeTopContributors();

/** Full ranked roster for the drawer (widget shows top 6; table expands). */
const TOP_CONTRIBUTORS_ROSTER: { name: string; team: string; hours: number; mins: number }[] = [
  ...topContributorsPayload.rows.map((r) => {
    const [h = 0, m = 0] = (r.hoursLabel ?? "0h 0m").match(/\d+/g)?.map(Number) ?? [0, 0];
    return { name: r.name, team: r.team, hours: h, mins: m };
  }),
  { name: "Abhishek Sharma", team: "Engineering", hours: 6, mins: 42 },
  { name: "Priya Negi", team: "Design", hours: 6, mins: 15 },
  { name: "Harsh Singh", team: "Product", hours: 5, mins: 50 },
  { name: "Ankit Kamal", team: "Sales", hours: 5, mins: 20 },
  { name: "Kiran Kumari Sharma", team: "Product", hours: 4, mins: 55 },
  { name: "Hemant Kumar Bhatt", team: "Engineering", hours: 4, mins: 30 },
];

/**
 * Drawer chart — hours rolled up by team (fixed buckets).
 * Never plot one bar per person; that fails at N≈1,000. Ranked people live in the table.
 */
export const topContributorsByHours: AxisChartPayload = (() => {
  const byTeam = new Map<string, number>();
  for (const r of TOP_CONTRIBUTORS_ROSTER) {
    const metric = round1(r.hours + r.mins / 60);
    byTeam.set(r.team, round1((byTeam.get(r.team) ?? 0) + metric));
  }
  const teams = [...byTeam.entries()].sort((a, b) => b[1] - a[1]);
  const teamColors: Record<string, string> = {
    Engineering: "#0ea5e9",
    Design: "#10b981",
    Product: "#8b5cf6",
    Sales: "#f59e0b",
  };
  return {
    xLabels: teams.map(([team]) => team),
    unit: "hrs",
    series: [
      {
        key: "Hours by team",
        color: "#0ea5e9",
        kind: "bar",
        data: teams.map(([, hrs]) => hrs),
        pointColors: teams.map(([team]) => teamColors[team] ?? "#64748b"),
      },
    ],
  };
})();

/** Itemized contributor table for the Top Contributors drawer. */
export function makeTopContributorsTable(): DataTablePayload {
  const all = TOP_CONTRIBUTORS_ROSTER.map((r) => ({
    ...r,
    metric: round1(r.hours + r.mins / 60),
  }));
  const total = all.reduce((s, r) => s + r.metric, 0);

  return {
    columns: [
      { key: "name", label: "Member", render: "avatar", pinned: true, width: 200 },
      { key: "team", label: "Team", width: 120 },
      { key: "hours", label: "Invested Hours", width: 130 },
      { key: "tasksCompleted", label: "Tasks Completed", width: 140 },
      { key: "projects", label: "Projects", render: "chipStack", width: 150 },
    ],
    rows: all.map((r, i) => {
      const share = Math.round((r.metric / total) * 100);
      const numProjects = Math.floor(between(1, 4));
      const projList = Array.from({ length: numProjects }, () => pick(["VC_LiveCart", "KIOO Labs", "Workstatus Product Dev", "VC_Angello", "MATCT", "cKymning App | FCP"]));
      return {
        name: r.name,
        team: r.team,
        hours: `${r.hours}h ${r.mins}m`,
        tasksCompleted: Math.floor(between(8, 42)),
        projects: Array.from(new Set(projList)).join("||"),
      };
    }),
  };
}

export function makeAppBreakdown(filter?: AppRow["category"]): AppRow[] {
  return APPS.filter((a) => !filter || a.category === filter)
    .map((a) => ({ app: a.app, category: a.category, color: a.color, hours: round1(between(0.1, 4)) }))
    .sort((a, b) => b.hours - a.hours);
}

/* -------------------------------- Donuts ---------------------------------- */

/** Legacy donut slices — kept for any remaining donut consumers. */
export const projectsWorked: DonutSlice[] = [
  { key: "Not Started", value: 203, color: PROJECT_STATUS_COLORS["Not Started"] },
  { key: "In Progress", value: 85, color: PROJECT_STATUS_COLORS["In Progress"] },
  { key: "Yet to Start", value: 16, color: PROJECT_STATUS_COLORS["Yet to Start"] },
  { key: "On Hold", value: 6, color: PROJECT_STATUS_COLORS["On Hold"] },
  { key: "Cancelled", value: 11, color: PROJECT_STATUS_COLORS.Cancelled },
  { key: "Completed", value: 7, color: PROJECT_STATUS_COLORS.Completed },
];

export const projectsWorkedPayload: ProjectsWorkedPayload = {
  statuses: [
    { key: "Not Started", value: 203, color: PROJECT_STATUS_COLORS["Not Started"] },
    { key: "In Progress", value: 85, color: PROJECT_STATUS_COLORS["In Progress"] },
    { key: "Yet to Start", value: 16, color: PROJECT_STATUS_COLORS["Yet to Start"] },
    { key: "On Hold", value: 6, color: PROJECT_STATUS_COLORS["On Hold"] },
    { key: "Cancelled", value: 11, color: PROJECT_STATUS_COLORS.Cancelled },
    { key: "Completed", value: 7, color: PROJECT_STATUS_COLORS.Completed },
  ],
  insight: {
    suggestion: "Consider reviewing resourcing and timelines to move more projects ahead.",
  },
};

/** Created vs completed tasks over the year — PMO Task Timeline Summary. */
export const taskTimelineSummary: TaskTimelineSummaryPayload = {
  yearLabel: "This Year (2026)",
  points: [
    { month: "Jan", fullLabel: "January 2026", created: 22, completed: 18 },
    { month: "Feb", fullLabel: "February 2026", created: 48, completed: 35 },
    { month: "Mar", fullLabel: "March 2026", created: 55, completed: 42 },
    { month: "Apr", fullLabel: "April 2026", created: 50, completed: 45 },
    { month: "May", fullLabel: "May 2026", created: 58, completed: 50 },
    { month: "Jun", fullLabel: "June 2026", created: 65, completed: 55 },
    { month: "Jul", fullLabel: "July 2026", created: 70, completed: 62 },
    { month: "Aug", fullLabel: "August 2026", created: 76, completed: 68 },
    { month: "Sep", fullLabel: "September 2026", created: 68, completed: 72 },
    { month: "Oct", fullLabel: "October 2026", created: 60, completed: 65 },
    { month: "Nov", fullLabel: "November 2026", created: 52, completed: 60 },
    { month: "Dec", fullLabel: "December 2026", created: 49, completed: 58 },
  ],
  totals: {
    created: 684,
    createdYoY: 12,
    createdPriorYear: 610,
    createdAvgPerMonth: 57,
    createdHigh: { month: "August", value: 76 },
    createdLow: { month: "January", value: 22 },
    completed: 617,
    completedYoY: 18,
    completedPriorYear: 523,
    completedAvgPerMonth: 51,
    completedHigh: { month: "September", value: 72 },
    completedLow: { month: "January", value: 18 },
    completionRate: 90,
    completionRateYoY: 5,
    completionRatePriorYear: 85,
  },
  insights: [
    {
      title: "Great progress!",
      message: "72 tasks were completed in September, which is 4 more than created.",
      highlights: ["72", "September", "4 more than created"],
      icon: "lightbulb",
    },
    {
      title: "Keep it up!",
      message: "You're on track to meet your annual goal.",
      icon: "target",
    },
  ],
};

/** Axis chart payload for Task Timeline Summary drawer. */
export const taskTimelineTrend: AxisChartPayload = {
  xLabels: taskTimelineSummary.points.map((p) => p.month),
  unit: "tasks",
  series: [
    {
      key: "Created Tasks",
      color: "#7c3aed",
      kind: "line",
      data: taskTimelineSummary.points.map((p) => p.created),
    },
    {
      key: "Completed Tasks",
      color: "#10b981",
      kind: "line",
      data: taskTimelineSummary.points.map((p) => p.completed),
    },
  ],
};

/** Monthly created vs completed breakdown for the Task Timeline drawer. */
export function makeTaskTimelineTable(): DataTablePayload {
  return {
    columns: [
      { key: "month", label: "Month", pinned: true, width: 140 },
      { key: "created", label: "Created", align: "right", width: 100 },
      { key: "completed", label: "Completed", align: "right", width: 110 },
      { key: "net", label: "Net (Completed − Created)", align: "right", width: 180 },
      { key: "completionRate", label: "Completion Rate", align: "right", render: "bar", width: 160 },
    ],
    rows: taskTimelineSummary.points.map((p) => {
      const net = p.completed - p.created;
      const rate = Math.round((p.completed / Math.max(p.created, 1)) * 100);
      return {
        month: p.fullLabel,
        created: p.created,
        completed: p.completed,
        net: net >= 0 ? `+${net}` : String(net),
        completionRate: Math.min(rate, 100),
      };
    }),
  };
}

/** Status count chart for the Projects Worked drawer. */
export const projectsWorkedByStatus: AxisChartPayload = {
  xLabels: projectsWorkedPayload.statuses.map((s) => s.key),
  series: [
    {
      key: "Projects",
      color: PROJECT_STATUS_COLORS["Not Started"],
      kind: "bar",
      data: projectsWorkedPayload.statuses.map((s) => s.value),
      pointColors: projectsWorkedPayload.statuses.map((s) => s.color),
    },
  ],
};

/** Layer-3 table for Projects Worked — sample projects aligned to widget statuses. */
export function makeProjectsWorkedTable(): DataTablePayload {
  const memberPool = PEOPLE.map((p) => p.name);
  const membersFor = (count: number, seed: number): string => {
    const picks: string[] = [];
    for (let i = 0; i < count; i++) {
      picks.push(memberPool[(seed + i * 3) % memberPool.length]);
    }
    return picks.join(", ");
  };

  const formatInvested = (hours: number, mins: number): string => {
    if (hours <= 0 && mins <= 0) return "0h 0m";
    return `${hours}h ${String(mins).padStart(2, "0")}m`;
  };

  const catalog: { project: string; lead: string; hours: number; mins: number; tasks: string; due: string }[] = [
    { project: "VC_Table Booking Manager", lead: PEOPLE[0].name, hours: 12, mins: 10, tasks: "5|20", due: "Oct 12, 2026" },
    { project: "Hadeeco Principal Platform", lead: PEOPLE[1].name, hours: 8, mins: 25, tasks: "2|18", due: "Oct 20, 2026" },
    { project: "PS Automation MVP | FCP", lead: PEOPLE[2].name, hours: 4, mins: 5, tasks: "1|10", due: "Nov 2, 2026" },
    { project: "cKymning App | FCP", lead: PEOPLE[3].name, hours: 6, mins: 40, tasks: "3|12", due: "Nov 8, 2026" },
    { project: "VC_LiveCart", lead: PEOPLE[4].name, hours: 428, mins: 15, tasks: "142|160", due: "Sep 28, 2026" },
    { project: "Workstatus Product Development", lead: PEOPLE[5].name, hours: 612, mins: 30, tasks: "284|300", due: "Oct 5, 2026" },
    { project: "KIOO Labs", lead: PEOPLE[6].name, hours: 356, mins: 45, tasks: "110|150", due: "Sep 22, 2026" },
    { project: "VC_StudyAtHome App | FCP", lead: PEOPLE[7].name, hours: 214, mins: 20, tasks: "85|120", due: "Oct 15, 2026" },
    { project: "PixelCrayons Design System", lead: PEOPLE[0].name, hours: 2, mins: 10, tasks: "0|15", due: "Nov 18, 2026" },
    { project: "Battforia Onboarding Hub", lead: PEOPLE[1].name, hours: 0, mins: 0, tasks: "0|8", due: "Dec 1, 2026" },
    { project: "VC_Angello", lead: PEOPLE[2].name, hours: 188, mins: 35, tasks: "54|100", due: "TBD" },
    { project: "MATCT", lead: PEOPLE[3].name, hours: 142, mins: 50, tasks: "38|80", due: "TBD" },
    { project: "Legacy CRM Migration", lead: PEOPLE[4].name, hours: 96, mins: 5, tasks: "45|50", due: "—" },
    { project: "Internal Wiki Refresh", lead: PEOPLE[5].name, hours: 28, mins: 15, tasks: "12|20", due: "—" },
    { project: "Ottova Portal v1", lead: PEOPLE[6].name, hours: 504, mins: 40, tasks: "210|210", due: "Aug 30, 2026" },
    { project: "QA Automation Suite", lead: PEOPLE[7].name, hours: 276, mins: 25, tasks: "92|92", due: "Sep 4, 2026" },
  ];

  return {
    columns: [
      { key: "project", label: "Project", pinned: true, width: 220 },
      { key: "lead", label: "Lead", render: "avatarOnly", width: 72 },
      { key: "tasks", label: "Tasks Completed", render: "fractionBar", width: 180 },
      { key: "hours", label: "Hours Invested", align: "right", width: 120 },
      { key: "due", label: "Due", align: "right", width: 120 },
    ],
    rows: catalog.map((row) => ({
      project: row.project,
      lead: row.lead,
      tasks: row.tasks,
      hours: formatInvested(row.hours, row.mins),
      due: row.due,
    })),
  };
}

export const taskStatus: DonutSlice[] = [
  { key: "To Do", value: 2985, color: "#0ea5e9" },
  { key: "In Progress", value: 1450, color: "#38bdf8" },
  { key: "In Review", value: 524, color: "#8b5cf6" },
  { key: "Completed", value: 15600, color: "#10b981" },
  { key: "Overdue", value: 1402, color: "#ef4444" },
];

/** Project-level open pipeline — complements the Task Status donut (no status re-plot). */
const TASK_STATUS_BY_PROJECT: {
  project: string;
  toDo: number;
  inProgress: number;
  inReview: number;
  overdue: number;
  completed: number;
}[] = [
  { project: "VC_PR Automation Phase 2", toDo: 420, inProgress: 210, inReview: 88, overdue: 312, completed: 2840 },
  { project: "PXL_Aurelic_Wordpress", toDo: 380, inProgress: 165, inReview: 72, overdue: 198, completed: 2100 },
  { project: "VC_Career AI Platform", toDo: 310, inProgress: 140, inReview: 54, overdue: 176, completed: 1680 },
  { project: "VC_Food Ordering | FCP", toDo: 265, inProgress: 128, inReview: 46, overdue: 142, completed: 1520 },
  { project: "VC_ShopperSense_FCP", toDo: 240, inProgress: 118, inReview: 40, overdue: 128, completed: 1340 },
  { project: "Workstatus Product Dev", toDo: 510, inProgress: 255, inReview: 96, overdue: 186, completed: 3120 },
  { project: "VC_New Cloud Networks", toDo: 220, inProgress: 102, inReview: 38, overdue: 94, completed: 1180 },
  { project: "VC_Table Booking Manager", toDo: 180, inProgress: 88, inReview: 30, overdue: 72, completed: 920 },
];

export function getTaskStatusReportMeta(): {
  total: number;
  open: number;
  overdue: number;
  inReview: number;
  completed: number;
  completionRate: number;
  topOverdueProject: string;
  topOverdueCount: number;
  narrative: string;
} {
  const byKey = (key: string): number =>
    taskStatus.find((s) => s.key === key)?.value ?? 0;
  const total = taskStatus.reduce((s, x) => s + x.value, 0);
  const completed = byKey("Completed");
  const overdue = byKey("Overdue");
  const inReview = byKey("In Review");
  const open = total - completed;
  const completionRate = Math.round((completed / Math.max(total, 1)) * 100);
  const top = [...TASK_STATUS_BY_PROJECT].sort((a, b) => b.overdue - a.overdue)[0];

  return {
    total,
    open,
    overdue,
    inReview,
    completed,
    completionRate,
    topOverdueProject: top.project,
    topOverdueCount: top.overdue,
    narrative:
      `${total.toLocaleString()} tasks across the portfolio — ${completionRate}% completed, ${open.toLocaleString()} still open. ` +
      `${overdue.toLocaleString()} are overdue (${Math.round((overdue / Math.max(open, 1)) * 100)}% of open work) and ${inReview.toLocaleString()} sit in review. ` +
      `${top.project} carries the heaviest overdue load (${top.overdue}) — clear that queue before new intake.`,
  };
}

/** Open vs overdue by project — scales as fixed project buckets, not one bar per task. */
export const taskStatusByProject: AxisChartPayload = {
  xLabels: TASK_STATUS_BY_PROJECT.map((p) =>
    p.project.length > 16 ? `${p.project.slice(0, 15)}…` : p.project,
  ),
  unit: "tasks",
  series: [
    {
      key: "Open (excl. completed)",
      color: "#0ea5e9",
      kind: "bar",
      data: TASK_STATUS_BY_PROJECT.map(
        (p) => p.toDo + p.inProgress + p.inReview + p.overdue,
      ),
    },
    {
      key: "Overdue",
      color: "#ef4444",
      kind: "line",
      data: TASK_STATUS_BY_PROJECT.map((p) => p.overdue),
    },
  ],
};

/** Actionable task rows for the Task Status drawer (aligned to donut statuses). */
export function makeTaskStatusTable(): DataTablePayload {
  const catalog: {
    task: string;
    project: string;
    assignee: string;
    status: string;
    due: string;
    logged: string;
  }[] = [
    { task: "Unblock webhook retry failures", project: "VC_PR Automation Phase 2", assignee: PEOPLE[0].name, status: "Overdue", due: "Sep 4, 2026", logged: "18h" },
    { task: "UAT sign-off checklist", project: "PXL_Aurelic_Wordpress", assignee: PEOPLE[1].name, status: "Overdue", due: "Sep 6, 2026", logged: "12h" },
    { task: "Resume parsing edge cases", project: "VC_Career AI Platform", assignee: PEOPLE[2].name, status: "Overdue", due: "Sep 8, 2026", logged: "22h" },
    { task: "Payment gateway timeout handling", project: "VC_Food Ordering | FCP", assignee: PEOPLE[3].name, status: "In Progress", due: "Sep 14, 2026", logged: "9h" },
    { task: "Design freeze for M1", project: "VC_ShopperSense_FCP", assignee: PEOPLE[5].name, status: "In Review", due: "Sep 12, 2026", logged: "14h" },
    { task: "Sprint board hygiene pass", project: "Workstatus Product Dev", assignee: PEOPLE[7].name, status: "In Progress", due: "Sep 15, 2026", logged: "6h" },
    { task: "API rate-limit docs", project: "VC_New Cloud Networks", assignee: PEOPLE[4].name, status: "To Do", due: "Sep 18, 2026", logged: "0h" },
    { task: "Client demo script", project: "VC_Table Booking Manager", assignee: PEOPLE[8].name, status: "In Review", due: "Sep 11, 2026", logged: "8h" },
    { task: "Load test Phase 2 APIs", project: "VC_PR Automation Phase 2", assignee: PEOPLE[0].name, status: "To Do", due: "Sep 20, 2026", logged: "2h" },
    { task: "Accessibility audit — checkout", project: "VC_Food Ordering | FCP", assignee: PEOPLE[6].name, status: "In Progress", due: "Sep 16, 2026", logged: "11h" },
    { task: "Release notes draft", project: "Workstatus Product Dev", assignee: PEOPLE[9].name, status: "To Do", due: "Sep 22, 2026", logged: "1h" },
    { task: "Fix flaky e2e suite", project: "PXL_Aurelic_Wordpress", assignee: PEOPLE[2].name, status: "Overdue", due: "Sep 7, 2026", logged: "15h" },
    { task: "Scoring model beta gate", project: "VC_Career AI Platform", assignee: PEOPLE[5].name, status: "In Review", due: "Sep 17, 2026", logged: "20h" },
    { task: "Inventory sync retry policy", project: "VC_ShopperSense_FCP", assignee: PEOPLE[3].name, status: "To Do", due: "Sep 19, 2026", logged: "0h" },
    { task: "Onboarding empty states", project: "Workstatus Product Dev", assignee: PEOPLE[4].name, status: "Completed", due: "Sep 5, 2026", logged: "7h" },
    { task: "VPN failover runbook", project: "VC_New Cloud Networks", assignee: PEOPLE[1].name, status: "In Progress", due: "Sep 13, 2026", logged: "5h" },
  ];

  const statusOrder: Record<string, number> = {
    Overdue: 0,
    "In Review": 1,
    "In Progress": 2,
    "To Do": 3,
    Completed: 4,
  };

  const rows = [...catalog].sort(
    (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9),
  );

  return {
    columns: [
      { key: "task", label: "Task", pinned: true, width: 240 },
      { key: "project", label: "Project", width: 180 },
      { key: "assignee", label: "Assignee", render: "avatar", width: 160 },
      { key: "status", label: "Status", render: "status", width: 120 },
      { key: "due", label: "Due", render: "dueDate", width: 110 },
      { key: "logged", label: "Logged", align: "right", width: 80 },
    ],
    rows: rows.map((r) => ({
      task: r.task,
      project: r.project,
      assignee: r.assignee,
      status: r.status,
      due: r.due,
      logged: r.logged,
    })),
  };
}

export const membersData: MembersPayload = {
  total: 45,
  online: 37,
  offline: 2,
  onLeave: 6,
  devices: [
    { name: "Android", count: 2 },
    { name: "iOS", count: 1 },
    { name: "Windows", count: 21 },
    { name: "MacOS", count: 8 },
    { name: "Linux", count: 13 },
    { name: "Web", count: 3 },
  ],
};

/** Upcoming Leaves — who is out and when they return. */
export const upcomingLeavesPayload: UpcomingLeavesPayload = {
  totalOnLeave: 6,
  insight: "6 members on leave — Sneha Desai returns today; Ananya Kapoor is back Monday.",
  rows: [
    {
      id: "ul-1",
      name: "Ananya Kapoor",
      department: "Engineering",
      leaveType: "PTO",
      returnLabel: "Back Mon",
      returnDate: "Sep 14, 2026",
      startDate: "Sep 11, 2026",
      days: 2,
    },
    {
      id: "ul-2",
      name: "Sneha Desai",
      department: "Product",
      leaveType: "Sick",
      returnLabel: "Today",
      returnDate: "Sep 11, 2026",
      startDate: "Sep 11, 2026",
      days: 1,
    },
    {
      id: "ul-3",
      name: "Hemant Kumar Bhatt",
      department: "Engineering",
      leaveType: "Casual",
      returnLabel: "Back Tue",
      returnDate: "Sep 15, 2026",
      startDate: "Sep 12, 2026",
      days: 2,
    },
    {
      id: "ul-4",
      name: "Priya Negi",
      department: "Design",
      leaveType: "PTO",
      returnLabel: "Back Wed",
      returnDate: "Sep 16, 2026",
      startDate: "Sep 11, 2026",
      days: 4,
    },
    {
      id: "ul-5",
      name: "Akshay Tyagi",
      department: "Marketing",
      leaveType: "WFH",
      returnLabel: "Back Thu",
      returnDate: "Sep 17, 2026",
      startDate: "Sep 15, 2026",
      days: 3,
    },
    {
      id: "ul-6",
      name: "Aarti Yadav",
      department: "Sales",
      leaveType: "Sick",
      returnLabel: "Back Fri",
      returnDate: "Sep 18, 2026",
      startDate: "Sep 16, 2026",
      days: 3,
    },
  ],
};

export function makeUpcomingLeavesTable(): DataTablePayload {
  const rows: TableRow[] = upcomingLeavesPayload.rows.map((r) => ({
    member: r.name,
    department: r.department,
    leaveType: r.leaveType,
    duration: `${r.startDate} - ${r.returnDate}`,
    days: r.days,
  }));
  return {
    columns: [
      { key: "member", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "department", label: "Department", width: 120 },
      { key: "leaveType", label: "Leave Type", render: "status", width: 110 },
      { key: "duration", label: "Leave Duration", width: 220 },
      { key: "days", label: "Days", align: "right", width: 80 },
    ],
    rows,
  };
}

export function getUpcomingLeavesReportMeta(): {
  total: number;
  sick: number;
  pto: number;
  returningToday: number;
  narrative: string;
} {
  const rows = upcomingLeavesPayload.rows;
  const sick = rows.filter((r) => r.leaveType === "Sick").length;
  const pto = rows.filter((r) => r.leaveType === "PTO").length;
  const returningToday = rows.filter((r) => r.returnLabel === "Today").length;
  return {
    total: upcomingLeavesPayload.totalOnLeave,
    sick,
    pto,
    returningToday,
    narrative: `${upcomingLeavesPayload.totalOnLeave} team members have upcoming or active leave. ${sick} are on sick leave and ${pto} on PTO; ${returningToday} expected back today.`,
  };
}

/* ------------------------------- Bar lists -------------------------------- */

export const topProfitable: BarListItem[] = [
  { label: "VC_Table Booking Manager", value: 2.28, time: "34% margin", color: "#22c55e" },
  { label: "VC_LiveCart", value: 1.9, time: "31% margin", color: "#22c55e" },
  { label: "KIOO Labs", value: 0.86, time: "28% margin", color: "#22c55e" },
  { label: "Hadeeco Principal", value: 0.44, time: "24% margin", color: "#22c55e" },
  { label: "PS Automation MVP | FCP", value: 0.31, time: "22% margin", color: "#22c55e" },
];

export const leastProfitable: BarListItem[] = [
  { label: "Website Redesign", value: 0.18, time: "8.4% margin", color: "#ef4444" },
  { label: "Mobile App Revamp", value: 0.24, time: "11.2% margin", color: "#ef4444" },
  { label: "CRM Migration", value: 0.31, time: "13.7% margin", color: "#ef4444" },
  { label: "Workstatus Product Dev", value: 0.42, time: "15.6% margin", color: "#ef4444" },
  { label: "VC_StudyAtHome App", value: 0.51, time: "18.2% margin", color: "#ef4444" },
];

type ProfitRow = {
  project: string;
  client: string;
  lead: string;
  profitM: number;
  marginPct: number;
  revenueM: number;
  costM: number;
  status: string;
};

const TOP_PROFITABLE_ROWS: ProfitRow[] = [
  { project: "VC_Table Booking Manager", client: "Ottova Inc", lead: "Priya Sharma", profitM: 2.28, marginPct: 34, revenueM: 6.7, costM: 4.42, status: "In Progress" },
  { project: "VC_LiveCart", client: "Ottova Inc", lead: "Rahul Mehta", profitM: 1.9, marginPct: 31, revenueM: 6.13, costM: 4.23, status: "In Progress" },
  { project: "KIOO Labs", client: "KIOO Labs", lead: "Anita Desai", profitM: 0.86, marginPct: 28, revenueM: 3.07, costM: 2.21, status: "In Progress" },
  { project: "Hadeeco Principal", client: "Hadeeco", lead: "Vikram Singh", profitM: 0.44, marginPct: 24, revenueM: 1.83, costM: 1.39, status: "In Progress" },
  { project: "PS Automation MVP | FCP", client: "Battforia", lead: "Sara Khan", profitM: 0.31, marginPct: 22, revenueM: 1.41, costM: 1.1, status: "Yet to Start" },
  { project: "cKymning App | FCP", client: "PixelCrayons", lead: "Dev Malhotra", profitM: 0.28, marginPct: 21, revenueM: 1.33, costM: 1.05, status: "In Progress" },
  { project: "Hadeeco Analytics Pack", client: "Hadeeco", lead: "Neha Kapoor", profitM: 0.22, marginPct: 20, revenueM: 1.1, costM: 0.88, status: "Completed" },
  { project: "Ottova Support Retainer", client: "Ottova Inc", lead: "Arjun Patel", profitM: 0.19, marginPct: 19, revenueM: 1.0, costM: 0.81, status: "In Progress" },
  { project: "VC_PR Automation Phase 2", client: "Battforia", lead: "Priya Sharma", profitM: 0.17, marginPct: 18, revenueM: 0.94, costM: 0.77, status: "In Progress" },
  { project: "VC_Career AI Platform", client: "PixelCrayons", lead: "Anita Desai", profitM: 0.16, marginPct: 18, revenueM: 0.89, costM: 0.73, status: "In Progress" },
  { project: "VC_StudyAtHome App | FCP", client: "Ottova Inc", lead: "Rahul Mehta", profitM: 0.15, marginPct: 17, revenueM: 0.88, costM: 0.73, status: "In Progress" },
  { project: "VC_Food Ordering | FCP", client: "Hadeeco", lead: "Vikram Singh", profitM: 0.14, marginPct: 17, revenueM: 0.82, costM: 0.68, status: "Yet to Start" },
  { project: "VC_New Cloud Networks", client: "KIOO Labs", lead: "Dev Malhotra", profitM: 0.13, marginPct: 16, revenueM: 0.81, costM: 0.68, status: "In Progress" },
  { project: "VC_ShopperSense_FCP", client: "Battforia", lead: "Sara Khan", profitM: 0.12, marginPct: 16, revenueM: 0.75, costM: 0.63, status: "In Progress" },
  { project: "PXL_Aurelic_Wordpress || FCP", client: "PixelCrayons", lead: "Neha Kapoor", profitM: 0.11, marginPct: 15, revenueM: 0.73, costM: 0.62, status: "Completed" },
  { project: "Workstatus Intelligence Dashboard", client: "Internal", lead: "Arjun Patel", profitM: 0.1, marginPct: 15, revenueM: 0.67, costM: 0.57, status: "In Progress" },
];

const LEAST_PROFITABLE_ROWS: ProfitRow[] = [
  { project: "Website Redesign", client: "PixelCrayons", lead: "Anita Desai", profitM: 0.18, marginPct: 8.4, revenueM: 2.14, costM: 1.96, status: "In Progress" },
  { project: "Mobile App Revamp", client: "Battforia", lead: "Neha Kapoor", profitM: 0.24, marginPct: 11.2, revenueM: 2.14, costM: 1.9, status: "In Progress" },
  { project: "CRM Migration", client: "Hadeeco", lead: "Vikram Singh", profitM: 0.31, marginPct: 13.7, revenueM: 2.26, costM: 1.95, status: "On Hold" },
  { project: "Workstatus Product Dev", client: "Internal", lead: "Arjun Patel", profitM: 0.42, marginPct: 15.6, revenueM: 2.69, costM: 2.27, status: "In Progress" },
  { project: "VC_StudyAtHome App", client: "Ottova Inc", lead: "Rahul Mehta", profitM: 0.51, marginPct: 18.2, revenueM: 2.8, costM: 2.29, status: "In Progress" },
  { project: "MATCT", client: "Battforia", lead: "Priya Sharma", profitM: 0.55, marginPct: 16.1, revenueM: 3.42, costM: 2.87, status: "On Hold" },
  { project: "VC_Angello", client: "Ottova Inc", lead: "Sara Khan", profitM: 0.62, marginPct: 14.8, revenueM: 4.19, costM: 3.57, status: "On Hold" },
];

const formatInrM = (n: number): string => `₹${n.toFixed(2)}M`;

const makeProfitabilityTable = (rows: ProfitRow[], polarity: "top" | "least"): DataTablePayload => {
  const ordered =
    polarity === "top"
      ? [...rows].sort((a, b) => b.profitM - a.profitM)
      : [...rows].sort((a, b) => a.marginPct - b.marginPct);
  return {
    columns: [
      { key: "project", label: "Project", pinned: true, width: 220 },
      { key: "client", label: "Client", width: 120 },
      { key: "lead", label: "Lead", render: "avatar", width: 140 },
      { key: "status", label: "Status", render: "status", width: 110 },
      { key: "revenue", label: "Revenue", width: 100 },
      { key: "cost", label: "Cost", width: 100 },
      { key: "profit", label: "Profit", width: 100 },
      { key: "margin", label: "Margin %", render: "bar", width: 140 },
    ],
    rows: ordered.map((r) => ({
      project: r.project,
      client: r.client,
      lead: r.lead,
      status: r.status,
      revenue: formatInrM(r.revenueM),
      cost: formatInrM(r.costM),
      profit: formatInrM(r.profitM),
      margin: Math.round(r.marginPct),
      health:
        r.marginPct >= 22 ? "good" : r.marginPct >= 15 ? "warn" : "bad",
    })),
  };
};

export function makeTopProfitableTable(): DataTablePayload {
  return makeProfitabilityTable(TOP_PROFITABLE_ROWS, "top");
}

export function makeLeastProfitableTable(): DataTablePayload {
  return makeProfitabilityTable(LEAST_PROFITABLE_ROWS, "least");
}

export function getTopProfitableReportMeta(): {
  totalProfit: string;
  topProject: string;
  topMargin: string;
  avgMargin: string;
  projectCount: number;
  narrative: string;
} {
  const sorted = [...TOP_PROFITABLE_ROWS].sort((a, b) => b.profitM - a.profitM);
  const total = sorted.reduce((s, r) => s + r.profitM, 0);
  const top = sorted[0];
  const avg = Math.round(sorted.reduce((s, r) => s + r.marginPct, 0) / sorted.length);
  const share = Math.round((top.profitM / total) * 100);
  const count = sorted.length;
  return {
    totalProfit: formatInrM(total),
    topProject: top.project,
    topMargin: `${top.marginPct}%`,
    avgMargin: `${avg}%`,
    projectCount: count,
    narrative: `${top.project} leads at ${formatInrM(top.profitM)} (${top.marginPct}% margin) — ${share}% of listed profit. ${count} projects total ${formatInrM(total)} with an average margin of ${avg}%.`,
  };
}

export function getLeastProfitableReportMeta(): {
  lowestProject: string;
  lowestMargin: string;
  avgMargin: string;
  under15: number;
  narrative: string;
} {
  const sorted = [...LEAST_PROFITABLE_ROWS].sort((a, b) => a.marginPct - b.marginPct);
  const lowest = sorted[0];
  const avg = Math.round(
    (LEAST_PROFITABLE_ROWS.reduce((s, r) => s + r.marginPct, 0) / LEAST_PROFITABLE_ROWS.length) * 10,
  ) / 10;
  const under15 = LEAST_PROFITABLE_ROWS.filter((r) => r.marginPct < 15).length;
  return {
    lowestProject: lowest.project,
    lowestMargin: `${lowest.marginPct}%`,
    avgMargin: `${avg}%`,
    under15,
    narrative: `${lowest.project} is weakest at ${formatInrM(lowest.profitM)} (${lowest.marginPct}% margin). ${under15} of ${LEAST_PROFITABLE_ROWS.length} listed projects sit below 15% margin — review scope and staffing before the next sprint.`,
  };
}

export const clientMargin: BarListItem[] = [
  { label: "Ottova Inc", value: 34.2, color: "#10b981" },
  { label: "Hadeeco", value: 28.5, color: "#10b981" },
  { label: "KIOO Labs", value: 22.1, color: "#10b981" },
  { label: "Battforia", value: 15.4, color: "#10b981" },
  { label: "PixelCrayons", value: 8.2, color: "#f59e0b" },
];

/** Executive — members with low activity today. */
export const lowActivityMembers = {
  rows: [
    { name: "Varun Joshi", department: "Engineering", project: "Payment Gateway", activity: 12, idle: "2h 18m" },
    { name: "Kavya Reddy", department: "Marketing", project: "Blog Campaign Q2", activity: 8, idle: "1h 45m" },
    { name: "Deepak Kumar", department: "Operations", project: "HR Policy Review", activity: 15, idle: "1h 20m" },
  ],
};

/** Executive — per-member workload capacity. */
export const workloadCapacity = {
  rows: [
    {
      name: "Arjun Singh",
      available: "40.00h",
      capacityPct: 113.58,
      billablePct: 92.14,
      band: "Over-allocated" as const,
    },
    {
      name: "Rahul Mehta",
      available: "40.00h",
      capacityPct: 87.78,
      billablePct: 91.04,
      band: "Healthy" as const,
    },
    {
      name: "Neha Kapoor",
      available: "40.00h",
      capacityPct: 107.0,
      billablePct: 88.5,
      band: "Over-allocated" as const,
    },
    {
      name: "Varun Joshi",
      available: "40.00h",
      capacityPct: 30.13,
      billablePct: 25.0,
      band: "Under-utilized" as const,
    },
    {
      name: "Kavya Reddy",
      available: "40.00h",
      capacityPct: 95.0,
      billablePct: 90.2,
      band: "Healthy" as const,
    },
  ],
};

export const pipelineForecast = {
  value: 78,
  max: 100,
  centerValue: "78%",
  centerLabel: "Capacity Booked",
  caption: "Healthy pipeline",
  target: "Target 80%",
};

export function makeTrackedHours(order: "most" | "least"): BarListItem[] {
  const base = PEOPLE.slice(order === "most" ? 0 : 8, order === "most" ? 5 : 10).map((p) => ({
    label: p.name,
    value: round1(order === "most" ? between(2, 8.5) : between(0.2, 1.2)),
    color: order === "most" ? "#10b981" : "#ef4444",
    sub: p.team,
  }));
  return base.sort((a, b) => (order === "most" ? b.value - a.value : a.value - b.value));
}

/** Members with the least tracked activity — same bar-list UI as Application Usage. */
export const trackedLeastHours: BarListItem[] = [
  { label: "Ankur Yadav", value: 15, idle: 85, time: "0h 48m", color: "rgba(239, 68, 68, 0.96)" },
  { label: "Tamanna Chauhan", value: 18, idle: 82, time: "1h 05m", color: "rgba(239, 68, 68, 0.96)" },
  { label: "Abhishek Tiwari", value: 22, idle: 78, time: "1h 22m", color: "rgba(239, 68, 68, 0.96)" },
  { label: "Siddharth Wadhwani", value: 28, idle: 72, time: "1h 48m", color: "rgba(239, 68, 68, 0.96)" },
  { label: "Aman Bansal", value: 31, idle: 69, time: "2h 06m", color: "rgba(239, 68, 68, 0.96)" },
];

/** Layer-3 table for Tracked Least Hours — same members/metrics as the widget. */
export function makeTrackedLeastHoursTable(): DataTablePayload {
  return {
    columns: [
      { key: "name", label: "Name", pinned: true, render: "avatar", width: 200 },
      { key: "activity", label: "Activity %", render: "bar", width: 180 },
      { key: "idle", label: "Idle %", width: 100 },
    ],
    rows: trackedLeastHours.map((item) => ({
      name: item.label,
      activity: item.value,
      idle: `${item.idle ?? Math.max(0, 100 - item.value)}%`,
    })),
  };
}

/** Layer-3 table for Workload capacity — widget rows first, then expanded list. */
export function makeWorkloadCapacityTable(): DataTablePayload {
  const columns = [
    { key: "name", label: "Name", pinned: true, render: "avatar" as const, width: 200 },
    { key: "available", label: "Avl Hrs.", width: 110 },
    { key: "capacityPct", label: "Capacity %", render: "bandPct" as const, width: 120 },
    { key: "billablePct", label: "Billable %", render: "bandPct" as const, width: 120 },
    { key: "band", label: "Band", render: "status" as const, width: 150 },
  ];

  const bandFor = (capacityPct: number): "Over-allocated" | "Healthy" | "Under-utilized" => {
    if (capacityPct > 100) return "Over-allocated";
    if (capacityPct >= 70) return "Healthy";
    return "Under-utilized";
  };

  const seedRows = workloadCapacity.rows.map((row) => ({
    name: row.name,
    available: row.available,
    capacityPct: row.capacityPct,
    billablePct: row.billablePct,
    band: row.band,
  }));

  const seen = new Set(seedRows.map((r) => r.name));
  const extraRows: TableRow[] = expandPeople(2)
    .filter((p) => !seen.has(p.name))
    .slice(0, 20)
    .map((p) => {
      const capacityPct = round1(between(22, 128));
      const billablePct = round1(Math.min(capacityPct, between(20, 98)));
      const band = bandFor(capacityPct);
      return {
        name: p.name,
        available: "40.00h",
        capacityPct,
        billablePct,
        band,
      };
    });

  return { columns, rows: [...seedRows, ...extraRows] };
}

/* ---------------------------- Axis-based charts --------------------------- */

export const profitLoss: AxisChartPayload = {
  xLabels: ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Oct–Dec)"],
  unit: "INR",
  series: [
    { key: "Profit", color: "#10b981", kind: "line", data: [420, 610, 540, 720] },
    { key: "Loss", color: "#ef4444", kind: "line", data: [180, 240, 300, 210] },
  ],
};

/** Weekly productivity / activity / idle trend for Executive Overview. */
export const productivityTrend: AxisChartPayload = {
  xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  unit: "%",
  series: [
    { key: "Productivity", color: "#5d2bff", kind: "line", data: [62, 68, 71, 65, 74, 48, 42] },
    { key: "Activity", color: "#0ea5e9", kind: "line", data: [58, 64, 69, 61, 72, 45, 38] },
    { key: "Idle", color: "#f59e0b", kind: "line", data: [12, 10, 8, 14, 9, 18, 22] },
  ],
};

/** Layer-3 table for Productivity Trend — same daily series as the widget. */
export function makeProductivityTrendTable(): DataTablePayload {
  const productivity = productivityTrend.series.find((s) => s.key === "Productivity")?.data ?? [];
  const activity = productivityTrend.series.find((s) => s.key === "Activity")?.data ?? [];
  const idle = productivityTrend.series.find((s) => s.key === "Idle")?.data ?? [];

  // Week of Mon 7 Sep 2026 — matches "This week" on the widget.
  const dates = [
    "07 Sep, 2026",
    "08 Sep, 2026",
    "09 Sep, 2026",
    "10 Sep, 2026",
    "11 Sep, 2026",
    "12 Sep, 2026",
    "13 Sep, 2026",
  ];

  return {
    columns: [
      { key: "date", label: "Date", pinned: true, width: 140 },
      { key: "productivity", label: "Productivity %", render: "bar", width: 180 },
      { key: "activity", label: "Activity %", width: 120 },
      { key: "idle", label: "Idle %", width: 100 },
    ],
    rows: dates.map((date, i) => ({
      date,
      productivity: productivity[i] ?? 0,
      activity: `${activity[i] ?? 0}%`,
      idle: `${idle[i] ?? 0}%`,
    })),
  };
}

function budgetSeries(
  allocated: number[],
  billing: number[],
  burn: number[],
): AxisChartPayload["series"] {
  return [
    { key: "Budget Allocated", color: "#c4b5fd", kind: "bar", data: allocated },
    { key: "Budget Billing", color: "#0ea5e9", kind: "bar", data: billing },
    { key: "Burn Rate", color: "#ef4444", kind: "line", dashed: true, data: burn },
  ];
}

/** Default quarterly series — also used by the budget report drawer. */
export const budgetTrend: AxisChartPayload = {
  xLabels: ["Q1", "Q2", "Q3", "Q4"],
  unit: "INR",
  series: budgetSeries([90, 60, 120, 105], [70, 45, 95, 88], [80, 52, 108, 96]),
};

export const budgetTrendPayload: BudgetTrendPayload = {
  defaultPeriod: "Quarterly",
  periods: {
    Weekly: {
      xLabels: Array.from({ length: 19 }, (_, i) => `W${String(i + 1).padStart(2, "0")}`),
      unit: "INR",
      series: budgetSeries(
        [3.2, 2.8, 3.5, 2.4, 3.1, 2.9, 3.8, 2.6, 3.4, 2.7, 3.0, 3.6, 2.5, 3.3, 2.8, 3.1, 2.9, 3.4, 2.6],
        [2.1, 1.9, 2.4, 1.6, 2.2, 2.0, 2.6, 1.8, 2.3, 1.9, 2.1, 2.5, 1.7, 2.2, 1.9, 2.1, 2.0, 2.3, 1.8],
        [2.6, 2.3, 2.9, 2.0, 2.6, 2.4, 3.1, 2.1, 2.8, 2.2, 2.5, 3.0, 2.0, 2.7, 2.3, 2.5, 2.4, 2.8, 2.1],
      ),
    },
    Monthly: {
      xLabels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      unit: "INR",
      series: budgetSeries(
        [12, 11, 14, 10, 13, 15, 12, 16, 14, 13, 12, 11],
        [9, 8, 11, 7, 10, 12, 9, 13, 11, 10, 9, 8],
        [10, 9, 12, 8, 11, 13, 10, 14, 12, 11, 10, 9],
      ),
    },
    Quarterly: budgetTrend,
    Yearly: {
      xLabels: ["2025", "2026"],
      unit: "INR",
      series: budgetSeries([42, 138], [48, 12], [45, 95]),
    },
  },
};

/** Project Budget Health — matches PMO reference card. */
export const projectBudgetHealthPayload: ProjectBudgetHealthPayload = {
  slices: [
    { key: "On Budget", value: 58, color: "#10b981" },
    { key: "At Risk", value: 18, color: "#f59e0b" },
    { key: "Over Budget", value: 10, color: "#ef4444" },
    { key: "Under Budget", value: 14, color: "#0ea5e9" },
  ],
  healthPercent: 82,
  healthLabel: "Budget Health",
  healthStatus: "Healthy",
  utilization: {
    spentShort: "$820K",
    budgetShort: "$1M",
    percent: 82,
    detail: "Spent $820,000 of $1,000,000",
  },
  bands: [
    {
      key: "On Budget",
      percentLabel: "58%",
      projects: 15,
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      key: "At Risk",
      percentLabel: "18%",
      projects: 5,
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      key: "Over Budget",
      percentLabel: "10%",
      projects: 3,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      key: "Under Budget",
      percentLabel: "14%",
      projects: 4,
      color: "#0284C7",
      bg: "#E0F2FE",
    },
  ],
  insight: {
    title: "3 projects are trending over budget",
    body: "Total expected overrun: $80K (8% above budget)",
  },
};

type BudgetBand = "On Budget" | "At Risk" | "Over Budget" | "Under Budget";

const BUDGET_HEALTH_ROWS: Array<{
  project: string;
  lead: string;
  band: BudgetBand;
  spent: number;
  budget: number;
  burn: number;
  overrun: number;
}> = [
  { project: "VC_Angello", lead: "Priya Sharma", band: "Over Budget", spent: 148_000, budget: 120_000, burn: 123, overrun: 28_000 },
  { project: "MATCT", lead: "Rahul Mehta", band: "Over Budget", spent: 96_000, budget: 72_000, burn: 133, overrun: 24_000 },
  { project: "Website Redesign", lead: "Anita Desai", band: "Over Budget", spent: 86_000, budget: 58_000, burn: 148, overrun: 28_000 },
  { project: "CRM Migration", lead: "Vikram Singh", band: "At Risk", spent: 71_000, budget: 75_000, burn: 95, overrun: 0 },
  { project: "Mobile App Revamp", lead: "Neha Kapoor", band: "At Risk", spent: 64_000, budget: 70_000, burn: 91, overrun: 0 },
  { project: "Workstatus Product Dev", lead: "Arjun Patel", band: "At Risk", spent: 112_000, budget: 125_000, burn: 90, overrun: 0 },
  { project: "PS Automation MVP", lead: "Sara Khan", band: "At Risk", spent: 54_000, budget: 60_000, burn: 90, overrun: 0 },
  { project: "cKymning App", lead: "Dev Malhotra", band: "At Risk", spent: 48_000, budget: 55_000, burn: 87, overrun: 0 },
  { project: "VC_Table Booking Manager", lead: "Priya Sharma", band: "On Budget", spent: 82_000, budget: 100_000, burn: 82, overrun: 0 },
  { project: "VC_LiveCart", lead: "Rahul Mehta", band: "On Budget", spent: 76_000, budget: 95_000, burn: 80, overrun: 0 },
  { project: "KIOO Labs", lead: "Anita Desai", band: "On Budget", spent: 58_000, budget: 80_000, burn: 73, overrun: 0 },
  { project: "Hadeeco Principal", lead: "Vikram Singh", band: "Under Budget", spent: 42_000, budget: 90_000, burn: 47, overrun: 0 },
  { project: "VC_StudyAtHome App", lead: "Neha Kapoor", band: "Under Budget", spent: 38_000, budget: 70_000, burn: 54, overrun: 0 },
];

const formatUsdShort = (n: number): string =>
  n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

/** Layer-3 itemized budget health for the drawer (overrun / at-risk first). */
export function makeBudgetHealthTable(): DataTablePayload {
  const bandOrder: Record<BudgetBand, number> = {
    "Over Budget": 0,
    "At Risk": 1,
    "On Budget": 2,
    "Under Budget": 3,
  };
  const sorted = [...BUDGET_HEALTH_ROWS].sort(
    (a, b) => bandOrder[a.band] - bandOrder[b.band] || b.burn - a.burn,
  );
  const rows: TableRow[] = sorted.map((r) => ({
    project: r.project,
    lead: r.lead,
    band: r.band,
    spent: formatUsdShort(r.spent),
    budget: formatUsdShort(r.budget),
    burn: r.burn,
    overrun: r.overrun > 0 ? formatUsdShort(r.overrun) : "—",
    health:
      r.band === "Over Budget" ? "bad" : r.band === "At Risk" ? "warn" : "good",
  }));
  return {
    columns: [
      { key: "project", label: "Project", pinned: true, width: 220 },
      { key: "lead", label: "Lead", render: "avatar", width: 140 },
      { key: "budget", label: "Budget", width: 90 },
      { key: "spent", label: "Spent", width: 90 },
      { key: "overrun", label: "Overrun", width: 90 },
    ],
    rows,
  };
}

export function getBudgetHealthReportMeta(): {
  healthPercent: number;
  overBudget: number;
  atRisk: number;
  overrunTotal: string;
  avgBurn: number;
  narrative: string;
} {
  const over = BUDGET_HEALTH_ROWS.filter((r) => r.band === "Over Budget");
  const atRisk = BUDGET_HEALTH_ROWS.filter((r) => r.band === "At Risk");
  const overrunSum = over.reduce((s, r) => s + r.overrun, 0);
  const avgBurn = Math.round(
    BUDGET_HEALTH_ROWS.reduce((s, r) => s + r.burn, 0) / BUDGET_HEALTH_ROWS.length,
  );
  const names = over.map((r) => r.project).join(", ");
  return {
    healthPercent: projectBudgetHealthPayload.healthPercent,
    overBudget: over.length,
    atRisk: atRisk.length,
    overrunTotal: formatUsdShort(overrunSum),
    avgBurn,
    narrative: `${over.length} projects are over budget (${names}) with ${formatUsdShort(overrunSum)} expected overrun (~8%). ${atRisk.length} more sit at risk above 85% burn — rebaseline scope before Q4 lock.`,
  };
}

export const memberLocation: AxisChartPayload = {
  xLabels: ["Apra Office", "Remote"],
  series: [{ key: "Member Present", color: "#0ea5e9", kind: "bar", data: [23, 4] }],
};

/* ------------------------------ Categories -------------------------------- */

export const categories: CategoriesPayload = {
  moreCount: 22,
  segments: [
    { key: "Undefined", value: 44, color: "#9ca3af" },
    { key: "Business Apps", value: 12, color: "#10b981" },
    { key: "Communication", value: 9, color: "#f59e0b" },
    { key: "Digital Marketing", value: 7, color: "#a259ff" },
    { key: "Social", value: 5, color: "#0ea5e9" },
    { key: "Design", value: 6, color: "#ec4899" },
    { key: "Other", value: 17, color: "#d1d5db" },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Mini tables (Layer 2 embedded)                                             */
/* -------------------------------------------------------------------------- */

/** Shared milestone catalog — widget shows the next 5; drawer expands the rest. */
type MilestoneRecord = {
  name: string;
  project: string;
  lead: string;
  start: string;
  end: string;
  done: number;
  total: number;
  hours: number;
  status: "Not Started" | "In Progress" | "At Risk" | "Completed";
};

const MILESTONE_CATALOG: MilestoneRecord[] = [
  {
    name: "M2| Development|1st September, 2026- 11th September, 2026",
    project: "PXL_Aurelic_Wordpress || FCP",
    lead: "Tamanna Chauhan",
    start: "Sep 1, 2026",
    end: "Sep 11, 2026",
    done: 2,
    total: 15,
    hours: 346,
    status: "At Risk",
  },
  {
    name: "Milestone 1",
    project: "VC_ShopperSense_FCP",
    lead: "Pallavi Singh",
    start: "Sep 5, 2026",
    end: "Sep 20, 2026",
    done: 0,
    total: 1,
    hours: 0,
    status: "Not Started",
  },
  {
    name: "Milestone 1",
    project: "VC_Food Ordering | FCP",
    lead: "Sanjana Pandey",
    start: "Aug 28, 2026",
    end: "Sep 18, 2026",
    done: 1,
    total: 4,
    hours: 28,
    status: "In Progress",
  },
  {
    name: "Milestone 2| 17August,2026-17Sep,2026",
    project: "VC_PR Automation Phase 2",
    lead: "Neha Keshri",
    start: "Aug 17, 2026",
    end: "Sep 17, 2026",
    done: 26,
    total: 50,
    hours: 524,
    status: "In Progress",
  },
  {
    name: "[Career AI Platform P1.1] Resume Parsing CR",
    project: "VC_Career At Platform | FCP",
    lead: "Saurabh Pathak",
    start: "Sep 2, 2026",
    end: "Sep 25, 2026",
    done: 0,
    total: 2,
    hours: 12,
    status: "At Risk",
  },
  {
    name: "M3| UAT Sign-off",
    project: "PXL_Aurelic_Wordpress || FCP",
    lead: "Tamanna Chauhan",
    start: "Sep 12, 2026",
    end: "Sep 22, 2026",
    done: 0,
    total: 8,
    hours: 0,
    status: "Not Started",
  },
  {
    name: "Milestone 2| API Hardening",
    project: "VC_Food Ordering | FCP",
    lead: "Abhishek Sharma",
    start: "Sep 15, 2026",
    end: "Sep 30, 2026",
    done: 3,
    total: 12,
    hours: 64,
    status: "In Progress",
  },
  {
    name: "M1| Design Freeze",
    project: "VC_ShopperSense_FCP",
    lead: "Pallavi Singh",
    start: "Aug 20, 2026",
    end: "Sep 8, 2026",
    done: 5,
    total: 5,
    hours: 86,
    status: "Completed",
  },
  {
    name: "Milestone 3| Load Testing",
    project: "VC_PR Automation Phase 2",
    lead: "Neha Keshri",
    start: "Sep 18, 2026",
    end: "Oct 2, 2026",
    done: 0,
    total: 10,
    hours: 0,
    status: "Not Started",
  },
  {
    name: "[Career AI] Interview Scoring Beta",
    project: "VC_Career At Platform | FCP",
    lead: "Priya Negi",
    start: "Sep 10, 2026",
    end: "Oct 5, 2026",
    done: 4,
    total: 18,
    hours: 142,
    status: "In Progress",
  },
  {
    name: "M2| Client Demo Prep",
    project: "VC_Table Booking Manager",
    lead: "Harsh Singh",
    start: "Sep 8, 2026",
    end: "Sep 16, 2026",
    done: 2,
    total: 6,
    hours: 48,
    status: "At Risk",
  },
  {
    name: "Milestone 1| Kickoff Deliverables",
    project: "VC_New Cloud Networks | Ottova",
    lead: "Ankit Kamal",
    start: "Sep 1, 2026",
    end: "Sep 14, 2026",
    done: 7,
    total: 9,
    hours: 118,
    status: "In Progress",
  },
];

const formatMilestoneProgress = (m: MilestoneRecord): string =>
  `${m.done}/${m.total} · ${m.hours} Hrs`;

const milestoneShortLabel = (name: string, max = 18): string => {
  const cleaned = name.split("|")[0]?.trim() || name;
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
};

/** Dashboard "today" used for due-window bucketing. */
const MILESTONE_TODAY = new Date(2026, 8, 10);

const parseMilestoneDue = (end: string): Date => new Date(end);

/** Upcoming = not completed (still on the delivery radar). */
const getUpcomingMilestones = (): MilestoneRecord[] =>
  MILESTONE_CATALOG.filter((m) => m.status !== "Completed").sort(
    (a, b) => parseMilestoneDue(a.end).getTime() - parseMilestoneDue(b.end).getTime(),
  );

type DueBucket = "Overdue" | "This week" | "Next 2 weeks" | "Later";

const dueBucketFor = (m: MilestoneRecord): DueBucket => {
  const due = parseMilestoneDue(m.end);
  due.setHours(0, 0, 0, 0);
  const today = new Date(MILESTONE_TODAY);
  today.setHours(0, 0, 0, 0);
  if (due < today) return "Overdue";
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  if (due <= weekEnd) return "This week";
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  if (due <= twoWeeks) return "Next 2 weeks";
  return "Later";
};

const daysUntilDue = (m: MilestoneRecord): number => {
  const due = parseMilestoneDue(m.end);
  due.setHours(0, 0, 0, 0);
  const today = new Date(MILESTONE_TODAY);
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
};

export function makeMilestones(): DataTablePayload {
  const upcoming = getUpcomingMilestones();
  // Widget preview keeps catalog order (next 5 open milestones).
  const preview = MILESTONE_CATALOG.filter((m) => m.status !== "Completed").slice(0, 5);
  const rows: TableRow[] = preview.map((m) => ({
    milestone: m.name,
    project: m.project,
    progress: formatMilestoneProgress(m),
  }));
  const leading = [...upcoming].sort(
    (a, b) => b.hours - a.hours || b.done / Math.max(b.total, 1) - a.done / Math.max(a.total, 1),
  )[0];
  return {
    columns: [
      { key: "milestone", label: "Milestone", pinned: true, width: 220 },
      { key: "project", label: "Project", width: 180 },
      { key: "progress", label: "Progress", align: "right", width: 120 },
    ],
    rows,
    insight: leading
      ? `${milestoneShortLabel(leading.name, 28)} on ${leading.project} leads with ${leading.done}/${leading.total} tasks and ${leading.hours} Hrs invested.`
      : "No upcoming milestones in the current window.",
  };
}

/** Upcoming milestones by due window — fixed buckets, scales to large N. */
export const milestonesProgressChart: AxisChartPayload = (() => {
  const upcoming = getUpcomingMilestones();
  const buckets: DueBucket[] = ["Overdue", "This week", "Next 2 weeks", "Later"];
  const colors: Record<DueBucket, string> = {
    Overdue: "#ef4444",
    "This week": "#f59e0b",
    "Next 2 weeks": "#0ea5e9",
    Later: "#94a3b8",
  };
  const counts = buckets.map((b) => upcoming.filter((m) => dueBucketFor(m) === b).length);
  const hours = buckets.map((b) =>
    upcoming.filter((m) => dueBucketFor(m) === b).reduce((s, m) => s + m.hours, 0),
  );
  const maxHours = Math.max(...hours, 1);
  const maxCount = Math.max(...counts, 1);
  const hoursScaled = hours.map((h) => Math.round((h / maxHours) * maxCount * 10) / 10);

  return {
    xLabels: [...buckets],
    unit: "milestones",
    series: [
      {
        key: "Upcoming milestones",
        color: "#0ea5e9",
        kind: "bar" as const,
        data: counts,
        pointColors: buckets.map((b) => colors[b]),
      },
      {
        key: "Hours invested (scaled)",
        color: "#7c3aed",
        kind: "line" as const,
        data: hoursScaled,
      },
    ],
  };
})();

/** Layer-3 itemized upcoming milestones for the drawer. */
export function makeMilestonesTable(): DataTablePayload {
  const upcoming = getUpcomingMilestones();
  return {
    columns: [
      { key: "milestone", label: "Milestone", pinned: true, width: 220 },
      { key: "project", label: "Project", width: 180 },
      { key: "lead", label: "Lead", render: "avatar", width: 160 },
      { key: "due", label: "Due", render: "dueDate", width: 110 },
      { key: "tasks", label: "Tasks", width: 90 },
      { key: "completion", label: "Completion", render: "bar", width: 130 },
      { key: "hours", label: "Hours", width: 90 },
    ],
    rows: upcoming.map((m) => {
      const completion = Math.round((m.done / Math.max(m.total, 1)) * 100);
      const days = daysUntilDue(m);
      return {
        milestone: m.name,
        project: m.project,
        lead: m.lead,
        due: m.end,
        dueIn: days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d`,
        status: m.status,
        tasks: `${m.done}/${m.total}`,
        remaining: Math.max(0, m.total - m.done),
        completion,
        hours: `${m.hours} Hrs`,
      };
    }),
  };
}

/** Aggregates for the Upcoming Milestones report header. */
export function getMilestonesReportMeta(): {
  total: number;
  atRisk: number;
  notStarted: number;
  inProgress: number;
  overdue: number;
  totalHours: number;
  openTasks: number;
  avgCompletion: number;
  dueThisWeek: number;
  narrative: string;
} {
  const upcoming = getUpcomingMilestones();
  const total = upcoming.length;
  const atRisk = upcoming.filter((m) => m.status === "At Risk").length;
  const notStarted = upcoming.filter((m) => m.status === "Not Started").length;
  const inProgress = upcoming.filter((m) => m.status === "In Progress").length;
  const overdue = upcoming.filter((m) => dueBucketFor(m) === "Overdue").length;
  const dueThisWeek = upcoming.filter((m) => dueBucketFor(m) === "This week").length;
  const totalHours = upcoming.reduce((s, m) => s + m.hours, 0);
  const openTasks = upcoming.reduce((s, m) => s + Math.max(0, m.total - m.done), 0);
  const avgCompletion = Math.round(
    upcoming.reduce((s, m) => s + m.done / Math.max(m.total, 1), 0) / Math.max(total, 1) * 100,
  );

  const hot = upcoming.filter((m) => m.status === "At Risk" || dueBucketFor(m) === "Overdue");
  const hotNames = hot
    .slice(0, 2)
    .map((m) => milestoneShortLabel(m.name, 22))
    .join(" and ");

  return {
    total,
    atRisk,
    notStarted,
    inProgress,
    overdue,
    totalHours,
    openTasks,
    avgCompletion,
    dueThisWeek,
    narrative:
      `${total} upcoming milestones on the board — ${dueThisWeek} due within 7 days` +
      (overdue > 0 ? `, ${overdue} already overdue` : "") +
      `. ${openTasks} open tasks remain across ${totalHours} Hrs invested. ` +
      (atRisk > 0 || overdue > 0
        ? `Prioritize ${hotNames || "at-risk workstreams"} before delivery windows slip.`
        : "Delivery windows look stable; keep the current cadence."),
  };
}

export function makeRecentTimesheets(): DataTablePayload {
  const rows: TableRow[] = PEOPLE.slice(0, 10).map((p) => {
    const start = 10 + Math.floor(between(0, 3));
    const min = Math.floor(between(0, 59));
    const dur = round1(between(0, 6));
    return {
      member: p.name,
      project: pick([
        "Product Sales & CRM | Workstatus",
        "Workstatus Product Development",
        "VC_New Cloud Networks | Ottova",
        "VC_Phionity Application | FCP",
        "PixelCrayons | Internal",
        "Internal_Business Development",
      ]),
      date: "07 Aug, 2026",
      start: formatAmPm(start, min),
      stop: formatAmPm(start, Math.min(59, min + 6)),
      duration: `00:0${Math.floor(dur)}:${String(Math.floor(between(0, 59))).padStart(2, "0")}`,
    };
  });
  return {
    columns: [
      { key: "member", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "project", label: "Projects", width: 240 },
      { key: "date", label: "Date", width: 110 },
      { key: "start", label: "Start Time", align: "right", width: 100 },
      { key: "stop", label: "Stop Time", align: "right", width: 100 },
      { key: "duration", label: "Duration", align: "right", width: 100 },
    ],
    rows,
  };
}

export function makeAttendance(): DataTablePayload {
  const checkins = [
    "09:30 AM|On Time",
    "09:40 AM|Late by 10 min",
    "—|Absent",
    "10:00 AM|Late by 30 min",
    "—|Not In Yet",
    "09:25 AM|On Time",
    "09:35 AM|Late by 5 min",
    "10:30 AM|Late by 1hr",
  ];
  const checkouts = ["06:30 PM|None", "07:00 PM|None", "None|—", "07:15 PM|None", "None|—", "06:45 PM|None", "07:30 PM|None", "06:10 PM|None"];
  const breakDurs = ["15m", "45m", "0m", "1h 10m", "0m", "30m", "1h 20m", "50m"];
  const rows: TableRow[] = PEOPLE.slice(0, 12).map((p, i) => {
    const [cTime, cStat] = checkins[i % checkins.length].split("|");
    const [coTime] = checkouts[i % checkouts.length].split("|");
    return {
      member: p.name,
      team: p.team,
      checkinTime: cTime,
      checkinStatus: cStat,
      checkout: coTime === "None" ? "—" : coTime,
      breaks: breakDurs[i % breakDurs.length],
    };
  });
  return {
    columns: [
      { key: "member", label: "Member Name", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 130 },
      { key: "checkinTime", label: "Check-in Time", width: 130 },
      { key: "checkout", label: "Check-out", width: 140 },
      { key: "breaks", label: "Breaks", width: 90 },
      { key: "checkinStatus", label: "Status", render: "status", width: 120 },
    ],
    rows,
  };
}

/* -------------------------------------------------------------------------- */
/*  Layer-3 detailed report tables                                             */
/* -------------------------------------------------------------------------- */

export function makeActivityTable(): DataTablePayload {
  const rows: TableRow[] = PEOPLE.map((p) => {
    const tracked = round1(between(30, 46));
    const active = round1(tracked * between(0.72, 0.96));
    const productivity = Math.round(between(48, 94));
    const focus = Math.round(between(35, 82));
    const idle = round1(tracked - active);
    return {
      name: p.name,
      team: p.team,
      role: p.role,
      tracked,
      active,
      idle,
      productivity,
      focus,
      delta: Math.round(between(-18, 22)),
      updated: `${Math.floor(between(1, 58))}m ago`,
    };
  });
  return {
    columns: [
      { key: "name", label: "Team Member", pinned: true, render: "avatar", width: 200 },
      { key: "team", label: "Team", width: 120 },
      { key: "role", label: "Role", width: 180 },
      { key: "tracked", label: "Productive Time", render: "hours", width: 120 },
      { key: "active", label: "Active Time", render: "hours", width: 110 },
      { key: "idle", label: "Idle Time", render: "hours", width: 100 },
      { key: "productivity", label: "Productivity", render: "bar", width: 140 },
      { key: "focus", label: "Focus", render: "bar", width: 120 },
      { key: "delta", label: "WoW", render: "delta", width: 90 },
      { key: "updated", label: "Updated", width: 100 },
    ],
    rows,
  };
}

export function makeProjectTable(): DataTablePayload {
  const projects = [
    "VC_Table Booking Manager",
    "VC_LiveCart",
    "KIOO Labs",
    "VC_Angello",
    "MATCT",
    "PS Automation MVP | FCP",
    "Workstatus Product Development",
    "cKymning App | FCP",
    "VC_StudyAtHome App | FCP",
    "Hadeeco Principal Platform",
  ];
  /** Vary lead count per row: 1, 2, or 3+ people. */
  const leadCounts = [1, 2, 3, 1, 2, 4, 1, 2, 3, 2];
  /** Mix past (red) and upcoming due dates — today is Sep 10, 2026. */
  const dueDates = [
    "Aug 10, 2026",
    "Oct 18, 2026",
    "Aug 22, 2026",
    "Nov 2, 2026",
    "Sep 4, 2026",
    "Dec 1, 2026",
    "Jul 28, 2026",
    "Oct 30, 2026",
    "Aug 15, 2026",
    "Nov 12, 2026",
  ];
  const statuses = ["Not Started", "In Progress", "At Risk", "On Hold", "Completed", "Cancelled"];
  const rows: TableRow[] = projects.map((name, i) => {
    const status = pick(statuses);
    const count = leadCounts[i] ?? 1;
    const leads = Array.from({ length: count }, (_, j) => PEOPLE[(i + j * 3) % PEOPLE.length].name);
    const hours = Math.floor(between(2, 940));
    const mins = Math.floor(between(0, 59));
    const totalTasks = Math.floor(between(20, 80));
    const completedTasks = Math.floor(between(0, totalTasks));
    const openTasks = totalTasks - completedTasks;
    const totalBudget = Math.floor(between(40, 200)) * 1000;
    const budgetUsedAmt = Math.floor(between(0.35, 0.98) * totalBudget);
    return {
      project: name,
      lead: leads.join(", "),
      status,
      progress: Math.round((completedTasks / Math.max(totalTasks, 1)) * 100),
      investedHours: `${hours}h ${mins}m`,
      budgetUsed: `₹${Math.round(budgetUsedAmt / 1000)}K / ₹${Math.round(totalBudget / 1000)}K`,
      openTasks: `${openTasks} / ${totalTasks}`,
      completedTasks: `${completedTasks} / ${totalTasks}`,
      health: status === "At Risk" ? "bad" : status === "In Progress" || status === "On Hold" ? "warn" : "good",
      due: dueDates[i] ?? `Oct ${10 + i}, 2026`,
    };
  });
  return {
    columns: [
      { key: "project", label: "Project", pinned: true, width: 220 },
      { key: "lead", label: "Lead", render: "avatarStack", width: 140 },
      { key: "investedHours", label: "Invested Hours", width: 130 },
      { key: "budgetUsed", label: "Budget Used", width: 150 },
      { key: "openTasks", label: "Open Tasks", width: 120 },
      { key: "completedTasks", label: "Completed Tasks", width: 140 },
    ],
    rows,
  };
}

export function makeBudgetBurnTable(): DataTablePayload {
  const projects = [
    "VC_Table Booking Manager",
    "VC_LiveCart",
    "KIOO Labs",
    "VC_Angello",
    "MATCT",
    "PS Automation MVP | FCP",
    "Workstatus Product Development",
    "cKymning App | FCP",
    "VC_StudyAtHome App | FCP",
    "Hadeeco Principal Platform",
  ];
  /** Vary lead count per row: 1, 2, or 3+ people. */
  const leadCounts = [1, 2, 3, 1, 2, 4, 1, 2, 3, 2];
  /** Mix past (red) and upcoming due dates — today is Sep 10, 2026. */
  const dueDates = [
    "Aug 10, 2026",
    "Oct 18, 2026",
    "Aug 22, 2026",
    "Nov 2, 2026",
    "Sep 4, 2026",
    "Dec 1, 2026",
    "Jul 28, 2026",
    "Oct 30, 2026",
    "Aug 15, 2026",
    "Nov 12, 2026",
  ];
  const statuses = ["Not Started", "In Progress", "At Risk", "On Hold", "Completed", "Cancelled"];
  const rows: TableRow[] = projects.map((name, i) => {
    const status = pick(statuses);
    const count = leadCounts[i] ?? 1;
    const leads = Array.from({ length: count }, (_, j) => PEOPLE[(i + j * 3) % PEOPLE.length].name);
    const hours = Math.floor(between(2, 940));
    const mins = Math.floor(between(0, 59));
    const totalTasks = Math.floor(between(20, 80));
    const completedTasks = Math.floor(between(0, totalTasks));
    const openTasks = totalTasks - completedTasks;
    const totalBudget = Math.floor(between(40, 200)) * 1000;
    const budgetUsedAmt = Math.floor(between(0.35, 0.98) * totalBudget);
    return {
      project: name,
      lead: leads.join(", "),
      status,
      progress: Math.round((completedTasks / Math.max(totalTasks, 1)) * 100),
      investedHours: `${hours}h ${mins}m`,
      budgetUsed: `₹${Math.round(budgetUsedAmt / 1000)}K / ₹${Math.round(totalBudget / 1000)}K`,
      openTasks: `${openTasks} / ${totalTasks}`,
      completedTasks: `${completedTasks} / ${totalTasks}`,
      health: status === "At Risk" ? "bad" : status === "In Progress" || status === "On Hold" ? "warn" : "good",
      due: dueDates[i] ?? `Oct ${10 + i}, 2026`,
    };
  });
  return {
    columns: [
      { key: "project", label: "Project", pinned: true, width: 220 },
      { key: "lead", label: "Lead", render: "avatarStack", width: 140 },
      { key: "status", label: "Status", render: "status", width: 110 },
      { key: "progress", label: "Progress", render: "bar", width: 150 },
      { key: "investedHours", label: "Invested Hours", width: 130 },
      { key: "budgetUsed", label: "Budget Used", width: 150 },
    ],
    rows,
  };
}
export function makeInvoiceTable(): DataTablePayload {
  const rows: TableRow[] = Array.from({ length: 12 }).map((_, i) => {
    const status = pick(["Paid", "Pending", "Overdue", "Paid", "Draft"]);
    return {
      invoice: `INV-2026-${String(1040 + i)}`,
      client: pick(["Ottova Inc", "Hadeeco", "KIOO Labs", "Battforia", "PixelCrayons", "Angello"]),
      amount: Math.round(between(20, 480)) * 1000,
      status,
      issued: `Jul ${5 + i}, 2026`,
      due: `Aug ${5 + i}, 2026`,
      health: status === "Overdue" ? "bad" : status === "Pending" ? "warn" : "good",
    };
  });
  return {
    columns: [
      { key: "invoice", label: "Invoice #", pinned: true, width: 150 },
      { key: "client", label: "Client", width: 160 },
      { key: "amount", label: "Amount", align: "right", render: "money", width: 130 },
      { key: "status", label: "Status", render: "status", width: 110 },
      { key: "issued", label: "Issued", align: "right", width: 120 },
      { key: "due", label: "Due", align: "right", width: 120 },
      { key: "health", label: "Health", align: "center", render: "health", width: 90 },
    ],
    rows,
  };
}

export function makeTaskTable(): DataTablePayload {
  const rows: TableRow[] = Array.from({ length: 14 }).map((_, i) => {
    const status = pick(["Overdue", "Due Tomorrow", "Yet to Start", "Triage", "In Progress"]);
    return {
      task: pick([
        "Fix billing webhook retry",
        "Design onboarding empty state",
        "API gateway rate limiting",
        "Migrate analytics events",
        "QA regression pass",
        "Update pricing page copy",
      ]),
      project: pick(["VC_LiveCart", "KIOO Labs", "Workstatus Product Dev", "VC_Angello"]),
      assignee: PEOPLE[i % PEOPLE.length].name,
      status,
      priority: pick(["High", "Medium", "Low"]),
      logged: `${Math.floor(between(1, 40))}h`,
      health: status === "Overdue" ? "bad" : status === "Due Tomorrow" ? "warn" : "good",
    };
  });
  return {
    columns: [
      { key: "task", label: "Task", pinned: true, width: 240 },
      { key: "project", label: "Project", width: 180 },
      { key: "assignee", label: "Assignee", render: "avatar", width: 180 },
      { key: "status", label: "Status", render: "status", width: 130 },
      { key: "priority", label: "Priority", width: 100 },
      { key: "logged", label: "Logged", width: 90 },
    ],
    rows,
  };
}

export function makeAppUsageTable(): DataTablePayload {
  const rows: TableRow[] = APPS.map((a) => ({
    app: a.app,
    category: a.category,
    hours: round1(between(2, 34)),
    users: Math.floor(between(3, 42)),
    productivity: Math.round(between(20, 95)),
    health:
      a.category === "Productive" ? "good" : a.category === "Neutral" ? "warn" : "bad",
  }));
  return {
    columns: [
      { key: "app", label: "Application / URL", pinned: true, width: 200 },
      { key: "category", label: "Classification", render: "status", width: 130 },
      { key: "hours", label: "Hours", align: "right", render: "hours", width: 100 },
      { key: "users", label: "Users", align: "right", width: 90 },
      { key: "productivity", label: "Productivity", align: "right", render: "bar", width: 150 },
      { key: "health", label: "Health", align: "center", render: "health", width: 90 },
    ],
    rows,
  };
}

/* -------------------------------------------------------------------------- */
/*  Widgets borrowed from the Insights module (rebuilt in our design language) */
/* -------------------------------------------------------------------------- */

/** Technology Usage — category allocation donut. */
export const categoryAllocation: DonutSlice[] = [
  { key: "Development", value: 25, color: "#0ea5e9" },
  { key: "Collaborative", value: 25, color: "#38bdf8" },
  { key: "CRM & ERP", value: 12, color: "#374151" },
  { key: "Company Specific", value: 20, color: "#f59e0b" },
  { key: "Design Tools", value: 14, color: "#ec4899" },
  { key: "Others", value: 4, color: "#9ca3af" },
];

/** Apps & URLs affecting focus — bar + attention-shift bubble. */
export const appsAffectingFocus: BarListItem[] = [
  { label: "youtube.com", value: 3.7, bubble: 164 },
  { label: "Google Docs", value: 1.3, bubble: 125 },
  { label: "freepik.com", value: 0.7, bubble: 59 },
  { label: "Jira", value: 0.6, bubble: 71 },
  { label: "slack", value: 0.5, bubble: 53 },
  { label: "Trello", value: 1.3, bubble: 125 },
  { label: "google.com", value: 0.5, bubble: 71 },
  { label: "Asana", value: 0.5, bubble: 71 },
];

/** Technology Usage — changes in category usage table. */
export function makeCategoryChanges(): DataTablePayload {
  const rows: TableRow[] = [
    { category: "Email", change: 5.5, allocation: 50.5, hrs: 42.7, users: 123 },
    { category: "Sales", change: 3.3, allocation: 27.5, hrs: 88.3, users: 256 },
    { category: "Office", change: 0.6, allocation: 5.6, hrs: 15.6, users: 78 },
    { category: "Chat & Meeting", change: -3.5, allocation: 33.5, hrs: 73.2, users: 199 },
    { category: "Education & Training", change: -2.5, allocation: 1.52, hrs: 29.4, users: 312 },
    { category: "HR & Hiring", change: -0.1, allocation: 19.4, hrs: 56.8, users: 45 },
  ];
  return {
    columns: [
      { key: "category", label: "Category", pinned: true, width: 180 },
      { key: "change", label: "Allocation % Change", align: "right", render: "delta", width: 160 },
      { key: "allocation", label: "Allocation %", align: "right", render: "bar", width: 140 },
      { key: "hrs", label: "Hrs", align: "right", render: "hours", width: 90 },
      { key: "users", label: "User Change", align: "right", width: 110 },
    ],
    rows,
  };
}

/** Project & Budget — top cost drivers (currency, structural gray). */
export const topCostDrivers: BarListItem[] = [
  { label: "Developers", value: 11, color: "#374151" },
  { label: "Design", value: 8.1, color: "#374151" },
  { label: "QA & Testing", value: 4.5, color: "#374151" },
  { label: "Server Costs", value: 3.2, color: "#374151" },
  { label: "PM's", value: 2, color: "#374151" },
  { label: "Tools", value: 2, color: "#374151" },
  { label: "Others", value: 0.8, color: "#374151" },
];

/** Efficiency & Utilization — utilization gauge. */
export const utilizationGauge = {
  value: 7.6,
  max: 8,
  centerValue: "825:58",
  centerLabel: "Avg. worked",
  headlineValue: "825:58",
  headlineLabel: "Above Average",
  target: "Avg. daily target: 8:00",
};

/** Application Usage — horizontal bar list (executive overview). */
export const applicationsUsage: BarListItem[] = [
  { label: "VS Code", value: 32, time: "13h 26m", color: "#4CCCE6" },
  { label: "Slack", value: 18, time: "7h 34m", color: "#4CCCE6" },
  { label: "Figma", value: 9, time: "3h 47m", color: "#4CCCE6" },
  { label: "Notion", value: 7, time: "2h 56m", color: "#4CCCE6" },
  { label: "Zoom", value: 5, time: "2h 06m", color: "#4CCCE6" },
  { label: "Teams", value: 4, time: "1h 41m", color: "#4CCCE6" },
];

/** Website Usage — horizontal bar list (executive overview). */
export const websitesUsage: BarListItem[] = [
  { label: "github.com", value: 14, time: "5h 19m", color: "#4CCCE6" },
  { label: "google.com", value: 11, time: "4h 11m", color: "#4CCCE6" },
  { label: "stackoverflow.com", value: 8, time: "3h 02m", color: "#4CCCE6" },
  { label: "linkedin.com", value: 6, time: "2h 17m", color: "#4CCCE6" },
  { label: "youtube.com", value: 5, time: "1h 54m", color: "#4CCCE6" },
  { label: "figma.com", value: 4, time: "1h 31m", color: "#4CCCE6" },
];

function usageClassFromColor(color?: string): "Productive" | "Neutral" | "Distracting" {
  if (color === "#22c55e" || color === "#10b981") return "Productive";
  if (color === "#ef4444") return "Distracting";
  return "Neutral";
}

/** Rank-based class when widget bars share a single accent color. */
function usageClassFromRank(index: number): "Productive" | "Neutral" | "Distracting" {
  if (index < 2) return "Productive";
  if (index < 4) return "Neutral";
  return "Distracting";
}

/** Layer-3 table for Application Usage — widget apps first, then more. */
export function makeApplicationUsageTable(): DataTablePayload {
  const extras: BarListItem[] = [
    { label: "Chrome", value: 3.5, color: "#f59e0b" },
    { label: "Jira", value: 3.2, color: "#22c55e" },
    { label: "GitHub Desktop", value: 2.8, color: "#22c55e" },
    { label: "Outlook", value: 2.4, color: "#f59e0b" },
    { label: "Postman", value: 2.1, color: "#22c55e" },
    { label: "Spotify", value: 1.8, color: "#ef4444" },
    { label: "WhatsApp", value: 1.5, color: "#ef4444" },
    { label: "Excel", value: 1.2, color: "#f59e0b" },
    { label: "Terminal", value: 1.0, color: "#22c55e" },
    { label: "Finder", value: 0.8, color: "#f59e0b" },
  ];
  const items = [...applicationsUsage, ...extras];
  return {
    columns: [
      { key: "name", label: "Application", pinned: true, width: 180 },
      { key: "usage", label: "Usage %", render: "bar", width: 160 },
      { key: "classification", label: "Classification", render: "status", width: 130 },
      { key: "hours", label: "Hours", width: 100 },
      { key: "users", label: "Users", width: 90 },
    ],
    rows: items.map((item, i) => ({
      name: item.label,
      usage: item.value,
      classification:
        item.color === "#4CCCE6" ? usageClassFromRank(i) : usageClassFromColor(item.color),
      hours: item.time ?? `${round1(item.value * 0.42)}h`,
      users: Math.max(3, 40 - i * 3),
    })),
  };
}

/** Layer-3 table for Website Usage — widget sites first, then more. */
export function makeWebsiteUsageTable(): DataTablePayload {
  const extras: BarListItem[] = [
    { label: "notion.so", value: 3.4, color: "#f59e0b" },
    { label: "docs.google.com", value: 3.1, color: "#22c55e" },
    { label: "chatgpt.com", value: 2.7, color: "#f59e0b" },
    { label: "jira.atlassian.com", value: 2.3, color: "#22c55e" },
    { label: "twitter.com", value: 2.0, color: "#ef4444" },
    { label: "reddit.com", value: 1.6, color: "#ef4444" },
    { label: "npmjs.com", value: 1.3, color: "#22c55e" },
    { label: "medium.com", value: 1.1, color: "#f59e0b" },
    { label: "vercel.com", value: 0.9, color: "#22c55e" },
    { label: "amazon.com", value: 0.7, color: "#ef4444" },
  ];
  const items = [...websitesUsage, ...extras];
  return {
    columns: [
      { key: "name", label: "Website", pinned: true, width: 200 },
      { key: "usage", label: "Usage %", render: "bar", width: 160 },
      { key: "classification", label: "Classification", render: "status", width: 130 },
      { key: "hours", label: "Hours", width: 100 },
      { key: "users", label: "Users", width: 90 },
    ],
    rows: items.map((item, i) => ({
      name: item.label,
      usage: item.value,
      classification:
        item.color === "#4CCCE6" ? usageClassFromRank(i) : usageClassFromColor(item.color),
      hours: item.time ?? `${round1(item.value * 0.38)}h`,
      users: Math.max(2, 36 - i * 2),
    })),
  };
}

/** Work Time Classification — core vs non-core split. */
export const workTimeClassification = {
  headline: { value: "77%", label: "Core work" },
  showAxis: true,
  segments: [
    { key: "Core work", value: 77, color: "#0ea5e9" },
    { key: "Non-core", value: 21, color: "#374151" },
    { key: "Neutral", value: 2, color: "#f59e0b" },
  ],
};

/** Daily Focus — progress ring. */
export const dailyFocus = {
  percent: 88,
  stats: [
    { label: "Focus Time", value: "5h 35m" },
    { label: "Focus Sessions", value: "5" },
    { label: "Avg. Session", value: "1h 43m" },
  ],
};

/** Team Comparison — employee working stat cluster. */
export const employeeWorking = {
  columns: 3,
  stats: [
    { label: "Working", value: "335", sub: "Total 350", accent: "#0ea5e9" },
    { label: "On Remote", value: "10", sub: "Out of 335", accent: "#0ea5e9" },
    { label: "On Leave", value: "5", sub: "Out of 350", accent: "#0ea5e9" },
  ],
};

export const avgActivityDay = {
  columns: 3,
  stats: [
    { label: "Activity", value: "59%", delta: "▼ -1% vs Goal", health: "bad" as const },
    { label: "Idle", value: "3%", delta: "▲ +2% vs Goal", health: "good" as const },
    { label: "Away", value: "14%", delta: "▼ -1% vs Goal", health: "bad" as const },
  ],
};

/** Executive — time log approval status (matches Application Usage bar list). */
export const timeLogApprovalStatus: BarListPayload = {
  unit: "hrs",
  insight: "42.5 hrs approved this period — 9.08 hrs still pending review.",
  items: [
    { label: "Approved", value: 42.5, color: "#22c55e" },
    { label: "Pending", value: 9.08, color: "#9ca3af" },
    { label: "Rejected", value: 2.1, color: "#ef4444" },
  ],
};

export const timeLogApprovalChart: AxisChartPayload = {
  xLabels: ["Approved", "Pending", "Rejected"],
  unit: "hrs",
  series: [
    {
      key: "Hours",
      color: "#22c55e",
      kind: "bar",
      data: [42.5, 9.08, 2.1],
      pointColors: ["#22c55e", "#9ca3af", "#ef4444"],
    },
  ],
};

export function makeTimeLogApprovalTable(): DataTablePayload {
  const rows: TableRow[] = PEOPLE.slice(0, 16).map((p, i) => {
    const status = pick(["Pending", "Approved", "Rejected", "Pending", "Approved"]);
    const hours = round1(between(0.5, 8.5));
    return {
      member: p.name,
      team: p.team,
      project: pick([
        "Workstatus Product Development",
        "VC_LiveCart",
        "KIOO Labs",
        "PixelCrayons | Internal",
      ]),
      hours: hours.toFixed(2),
      status,
      submitted: "Sep 11, 2026",
      health: status === "Rejected" ? "bad" : status === "Pending" ? "warn" : "good",
    };
  });
  return {
    columns: [
      { key: "member", label: "Member", pinned: true, render: "avatar", width: 180 },
      { key: "team", label: "Team", width: 120 },
      { key: "project", label: "Project", width: 220 },
      { key: "hours", label: "Hours", align: "right", width: 90 },
      { key: "status", label: "Status", render: "status", width: 110 },
      { key: "submitted", label: "Submitted", width: 120 },
    ],
    rows,
  };
}

/** Location & Work Mode — avg activity by working mode. */
export const activityByMode = {
  rows: [
    { label: "Office", percent: 77, value: "7.7 hrs/day", color: "#0ea5e9" },
    { label: "Remote", percent: 85, value: "8.5 hrs/day", color: "#0ea5e9" },
    { label: "Hybrid", percent: 45, value: "4.5 hrs/day", color: "#0ea5e9" },
  ],
};

/** Location & Work Mode — avg start & end of day by location. */
export const startEndByLocation = {
  axisStart: 0,
  axisEnd: 24,
  rows: [
    { label: "Office", start: 9.5, end: 14 },
    { label: "Remote", start: 6, end: 11 },
    { label: "Hybrid", start: 9, end: 15 },
  ],
};

/** Efficiency & Workload — workload balance table. */
export function makeWorkloadBalance(): DataTablePayload {
  const rows: TableRow[] = [
    { team: "Sales", over: 67, under: 5, breaks: 3.4, mins: 2.8 },
    { team: "Marketing", over: 82, under: 3, breaks: 4.2, mins: 4.1 },
    { team: "Consultants", over: 54, under: 7, breaks: 5.0, mins: 5.6 },
    { team: "Accounting", over: 73, under: 2, breaks: 2.9, mins: 3.0 },
    { team: "Developer", over: 89, under: 6, breaks: 3.7, mins: 3.9 },
    { team: "Designer", over: 76, under: 1, breaks: 4.5, mins: 4.7 },
    { team: "HR & Hiring", over: 48, under: 4, breaks: 5.3, mins: 5.1 },
  ];
  return {
    columns: [
      { key: "team", label: "Team", pinned: true, width: 150 },
      { key: "over", label: "% Days Overutilized", align: "right", render: "bar", width: 160 },
      { key: "under", label: "% Days Underutilized", align: "right", width: 150 },
      { key: "breaks", label: "Breaks/Day", align: "right", width: 110 },
      { key: "mins", label: "Avg Mins/Break", align: "right", width: 130 },
    ],
    rows,
  };
}

/* -------------------------------------------------------------------------- */
/*  Executive KPI Layer-3 tables                                               */
/* -------------------------------------------------------------------------- */

function expandPeople(multiplier = 3): typeof PEOPLE {
  const extras = [
    "Neha Kapoor",
    "Rohan Mehta",
    "Divya Nair",
    "Vikram Joshi",
    "Ishita Bose",
    "Karan Malhotra",
    "Meera Iyer",
    "Siddharth Rao",
    "Ananya Das",
    "Rahul Verma",
    "Pooja Sethi",
    "Nikhil Jain",
    "Shreya Pant",
    "Aman Gupta",
    "Tanvi Shah",
  ];
  const base = [...PEOPLE];
  for (let m = 1; m < multiplier; m++) {
    extras.forEach((name, i) => {
      const src = PEOPLE[i % PEOPLE.length];
      base.push({
        name: m === 1 ? name : `${name} ${m}`,
        team: src.team,
        role: src.role,
      });
    });
  }
  return base;
}

function formatHm(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/** Worked Today — per-member hours logged today. */
export function makeWorkedTodayTable(): DataTablePayload {
  const rows: TableRow[] = expandPeople(3).map((p) => {
    const productiveMins = Math.round(between(60, 480));
    const idleMins = Math.round(productiveMins * between(0.05, 0.25));
    const activityMins = Math.max(0, productiveMins - idleMins);
    const effectiveMins = productiveMins + Math.round(between(10, 45));
    const breakMins = Math.round(between(15, 60));
    const activityPct = Math.round((activityMins / Math.max(1, productiveMins)) * 100);
    const yesterdayMins = Math.round(productiveMins * between(0.75, 1.2));
    const deltaMins = productiveMins - yesterdayMins;

    return {
      name: p.name,
      team: p.team,
      role: p.role,
      productiveTime: formatHm(productiveMins),
      effectiveTime: formatHm(effectiveMins),
      activityTime: formatHm(activityMins),
      idleTime: formatHm(idleMins),
      breakTime: formatHm(breakMins),
      activity: activityPct,
      vsYesterday: `${deltaMins >= 0 ? "+" : "−"}${formatHm(Math.abs(deltaMins))}`,
    };
  });

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 180 },
      { key: "team", label: "Team", width: 110 },
      { key: "productiveTime", label: "Productive Time", width: 120 },
      { key: "effectiveTime", label: "Effective Time", width: 120 },
      { key: "activityTime", label: "Activity Time", width: 110 },
      { key: "idleTime", label: "Idle Time", width: 90 },
      { key: "breakTime", label: "Break Time", width: 100 },
      { key: "activity", label: "Activity %", render: "bar", width: 140 },
    ],
    rows,
  };
}

/** Today's Activity — activity / idle / away per member today. */
export function makeTodaysActivityTable(): DataTablePayload {
  const rows: TableRow[] = expandPeople(3).map((p) => {
    const activity = Math.round(between(18, 92));
    const idlePct = Math.round(between(0, 18));
    const awayPct = Math.max(0, 100 - activity - idlePct);
    const totalMins = Math.round(between(180, 420));
    const activeMins = Math.round((activity / 100) * totalMins);
    const idleMins = Math.round((idlePct / 100) * totalMins);
    const breakMins = Math.round((awayPct / 100) * totalMins);
    return {
      name: p.name,
      team: p.team,
      role: p.role,
      activity,
      idle: `${idlePct}%|${formatHm(idleMins)}`,
      breakTime: formatHm(breakMins),
      activeMins: formatHm(activeMins),
      delta: Math.round(between(-12, 14)),
    };
  });

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 120 },
      { key: "activity", label: "Activity %", align: "right", render: "bar", width: 140 },
      { key: "idle", label: "Idle %", align: "right", render: "hoverTooltip", width: 90 },
      { key: "breakTime", label: "Break Time", align: "right", width: 100 },
      { key: "activeMins", label: "Active Time", align: "right", width: 110 },
      { key: "delta", label: "vs Yday", align: "right", render: "delta", width: 90 },
    ],
    rows,
  };
}

/** Utilization Rate — billable vs capacity per member. */
export function makeUtilizationTable(): DataTablePayload {
  const rows: TableRow[] = expandPeople(3).map((p) => {
    const utilization = Math.round(between(42, 98));
    const billable = Math.round(utilization * between(0.7, 0.95));
    const capacityHrs = 40;
    const workedHrs = round1((utilization / 100) * capacityHrs);
    return {
      name: p.name,
      team: p.team,
      role: p.role,
      utilization,
      billable,
      workedHrs,
      capacityHrs,
      status: utilization < 60 ? "Under-utilized" : utilization < 80 ? "Optimal" : utilization <= 95 ? "Heavy" : "Over-allocated",
    };
  });

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 120 },
      { key: "utilization", label: "Utilization", align: "right", render: "bar", width: 140 },
      { key: "billable", label: "Billable %", align: "right", width: 100 },
      { key: "workedHrs", label: "Worked Hrs", align: "right", render: "hours", width: 110 },
      { key: "capacityHrs", label: "Capacity", align: "right", render: "hours", width: 100 },
      { key: "status", label: "Status", align: "right", render: "status", width: 120 },
    ],
    rows,
  };
}

/** Resource Bench — people currently available / on bench. */
export function makeBenchTable(): DataTablePayload {
  const benchPeople = expandPeople(2).filter((_, i) => i % 2 === 0).slice(0, 18);
  const rows: TableRow[] = benchPeople.map((p) => {
    const availableHrs = round1(between(10, 40));
    const capacityPct = Math.round(between(10, 90));
    let band = "Under-utilized";
    if (capacityPct > 100) band = "Over-allocated";
    else if (capacityPct >= 70) band = "Healthy";

    return {
      name: p.name,
      team: p.team,
      role: p.role,
      availableHrs,
      capacityPct,
      band,
    };
  });

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 120 },
      { key: "role", label: "Role", width: 180 },
      { key: "availableHrs", label: "Available Hrs", width: 120 },
      { key: "capacityPct", label: "Capacity %", render: "bandPct", width: 120 },
      { key: "band", label: "Band", render: "status", width: 130 },
    ],
    rows,
  };
}

/** Hourly worked-hours trend for today (for Worked Today drawer chart). */
export const workedTodayTrend: AxisChartPayload = {
  xLabels: ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"],
  unit: "hrs",
  series: [
    { key: "Org hours", color: "#0ea5e9", kind: "bar", data: [4.2, 9.8, 12.4, 6.1, 3.2, 11.6, 10.8, 8.4] },
    { key: "Yesterday", color: "#94a3b8", kind: "line", dashed: true, data: [3.8, 8.6, 11.2, 5.4, 2.9, 10.1, 9.4, 7.2] },
  ],
};

/** Activity % by hour today. */
export const todaysActivityTrend: AxisChartPayload = {
  xLabels: ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"],
  unit: "%",
  series: [
    { key: "Activity", color: "#6366f1", kind: "line", data: [28, 46, 58, 34, 22, 52, 61, 41] },
    { key: "Idle", color: "#f59e0b", kind: "line", data: [8, 6, 4, 12, 18, 7, 5, 9] },
  ],
};

/** Utilization split trend by week. */
export const utilizationTrend: AxisChartPayload = {
  xLabels: ["W1", "W2", "W3", "W4"],
  unit: "%",
  series: [
    { key: "Billable", color: "#10b981", kind: "bar", data: [74, 71, 69, 72] },
    { key: "Non-Billable", color: "#f59e0b", kind: "bar", data: [12, 15, 16, 14] },
    { key: "Bench", color: "#374151", kind: "bar", data: [14, 14, 15, 14] },
  ],
};

/** Bench hours available by team. */
export const benchByTeam: AxisChartPayload = {
  xLabels: ["Engineering", "Design", "Product", "Sales", "Support"],
  unit: "hrs",
  series: [
    { key: "Bench hours", color: "#6366f1", kind: "bar", data: [42, 18, 12, 24, 16] },
  ],
};

