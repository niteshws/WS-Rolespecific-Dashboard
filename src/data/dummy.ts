import type {
  ScatterPoint,
  HeatCell,
  LeaderRow,
  AppRow,
  HealthLevel,
  DataTablePayload,
  BarListItem,
  DonutSlice,
  CategoriesPayload,
  MembersPayload,
  AxisChartPayload,
  TableRow,
} from "@/types";

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

export function makeAppBreakdown(filter?: AppRow["category"]): AppRow[] {
  return APPS.filter((a) => !filter || a.category === filter)
    .map((a) => ({ app: a.app, category: a.category, color: a.color, hours: round1(between(0.1, 4)) }))
    .sort((a, b) => b.hours - a.hours);
}

/* -------------------------------- Donuts ---------------------------------- */

export const projectsWorked: DonutSlice[] = [
  { key: "Yet to Start", value: 16, color: "#38bdf8" },
  { key: "In Progress", value: 85, color: "#f59e0b" },
  { key: "On Hold", value: 6, color: "#8b5cf6" },
  { key: "Complete", value: 7, color: "#10b981" },
  { key: "Cancelled", value: 11, color: "#ef4444" },
  { key: "Archived", value: 203, color: "#374151" },
];

export const taskStatus: DonutSlice[] = [
  { key: "To Do", value: 2985, color: "#0ea5e9" },
  { key: "In Progress", value: 1450, color: "#38bdf8" },
  { key: "In Review", value: 524, color: "#8b5cf6" },
  { key: "Completed", value: 15600, color: "#10b981" },
  { key: "Overdue", value: 1402, color: "#ef4444" },
];

export const membersData: MembersPayload = {
  total: 45,
  online: 37,
  offline: 8,
  onLeave: 0,
  devices: [
    { name: "Android", count: 2 },
    { name: "iOS", count: 1 },
    { name: "Windows", count: 21 },
    { name: "MacOS", count: 8 },
    { name: "Linux", count: 13 },
    { name: "Web", count: 3 },
  ],
};

/* ------------------------------- Bar lists -------------------------------- */

export const topProfitable: BarListItem[] = [
  { label: "VC_Table Booking Mana…", value: 2.28, color: "#0ea5e9" },
  { label: "VC_LiveCart", value: 1.9, color: "#0ea5e9" },
  { label: "KIOO Labs", value: 0.86, color: "#0ea5e9" },
  { label: "Hadeeco Principal…", value: 0.44, color: "#0ea5e9" },
  { label: "PS Automation MVP | FCP", value: 0.31, color: "#0ea5e9" },
];

export const leastProfitable: BarListItem[] = [
  { label: "Website Redesign", value: 8.4, color: "#ef4444" },
  { label: "Mobile App Revamp", value: 11.2, color: "#ef4444" },
  { label: "CRM Migration", value: 13.7, color: "#f59e0b" },
  { label: "Workstatus Product Dev…", value: 15.6, color: "#f59e0b" },
  { label: "VC_StudyAtHome App |…", value: 18.2, color: "#10b981" },
];

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
  { label: "Ankur Yadav", value: 15, idle: 85, color: "rgba(239, 68, 68, 0.96)" },
  { label: "Tamanna Chauhan", value: 18, idle: 82, color: "rgba(239, 68, 68, 0.96)" },
  { label: "Abhishek Tiwari", value: 22, idle: 78, color: "rgba(239, 68, 68, 0.96)" },
  { label: "Siddharth Wadhwani", value: 28, idle: 72, color: "rgba(239, 68, 68, 0.96)" },
  { label: "Aman Bansal", value: 31, idle: 69, color: "rgba(239, 68, 68, 0.96)" },
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
    { key: "available", label: "Available", width: 110 },
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

export const budgetTrend: AxisChartPayload = {
  xLabels: ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Oct–Dec)"],
  unit: "INR",
  series: [
    { key: "Budgeted", color: "#c4b5fd", kind: "bar", data: [90, 60, 120, 105] },
    { key: "Invoiced", color: "#0ea5e9", kind: "bar", data: [70, 45, 95, 88] },
    { key: "Budget Trend", color: "#ef4444", kind: "line", dashed: true, data: [80, 52, 108, 96] },
  ],
};

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

export function makeMilestones(): DataTablePayload {
  const rows: TableRow[] = [
    { milestone: "Phase 2 Sprint 1", project: "VC_BattForia | Dedicated", progress: "0/4 · 93 Hrs" },
    { milestone: "Milestone 1 Test", project: "eishvi test", progress: "0/1 · 2 Hrs" },
    { milestone: "Career in Platform PL", project: "VC_Career At Platform | FCP", progress: "0/2 · 12 Hrs" },
    { milestone: "Design & Discovery", project: "VC_AI Persona Avatar MVP", progress: "0/2 · 8 Hrs" },
    { milestone: "Milestone 1", project: "VC_Fractur Communication", progress: "0/1 · 5 Hrs" },
  ];
  return {
    columns: [
      { key: "milestone", label: "Milestone", pinned: true, width: 170 },
      { key: "project", label: "Project", width: 200 },
      { key: "progress", label: "Progress", align: "right", width: 120 },
    ],
    rows,
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
      start: `${start}:${String(min).padStart(2, "0")} AM`,
      stop: `${start}:${String(Math.min(59, min + 6)).padStart(2, "0")} AM`,
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
  const statuses = ["09:20:22", "05:56:45", "Absent", "01:59:53", "NOT IN YET", "03:26:28", "NOT IN YET", "09:38:29", "09:59:59"];
  const rows: TableRow[] = PEOPLE.slice(0, 10).map((p, i) => ({
    member: p.name,
    team: p.team,
    status: statuses[i % statuses.length],
    breaks: `${Math.floor(between(1, 4))}`,
    late: i % 3 === 0 ? "Yes" : "No",
  }));
  return {
    columns: [
      { key: "member", label: "Member Name", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 130 },
      { key: "status", label: "7 Aug", align: "right", render: "status", width: 120 },
      { key: "breaks", label: "Breaks", align: "right", width: 90 },
      { key: "late", label: "Late", align: "center", width: 80 },
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
      health: healthFrom(productivity),
      updated: `${Math.floor(between(1, 58))}m ago`,
    };
  });
  return {
    columns: [
      { key: "name", label: "Team Member", pinned: true, render: "avatar", width: 200 },
      { key: "team", label: "Team", width: 120 },
      { key: "role", label: "Role", width: 180 },
      { key: "tracked", label: "Tracked", align: "right", render: "hours", width: 100 },
      { key: "active", label: "Active", align: "right", render: "hours", width: 100 },
      { key: "idle", label: "Idle", align: "right", render: "hours", width: 90 },
      { key: "productivity", label: "Productivity", align: "right", render: "bar", width: 140 },
      { key: "focus", label: "Focus", align: "right", render: "bar", width: 120 },
      { key: "delta", label: "WoW", align: "right", render: "delta", width: 90 },
      { key: "health", label: "Health", align: "center", render: "health", width: 90 },
      { key: "updated", label: "Updated", align: "right", width: 100 },
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
  const statuses = ["On Track", "At Risk", "Delayed", "On Track", "On Track"];
  const rows: TableRow[] = projects.map((name, i) => {
    const status = pick(statuses);
    return {
      project: name,
      lead: PEOPLE[i % PEOPLE.length].name,
      status,
      progress: Math.round(between(20, 98)),
      budgetUsed: Math.round(between(60, 100)),
      profit: Math.round(between(-470, 230)) / 100,
      hoursLogged: Math.round(between(120, 940)),
      openTasks: Math.floor(between(3, 42)),
      blockers: Math.floor(between(0, 6)),
      health: status === "Delayed" ? "bad" : status === "At Risk" ? "warn" : "good",
      due: `Aug ${10 + i}, 2026`,
    };
  });
  return {
    columns: [
      { key: "project", label: "Project", pinned: true, width: 220 },
      { key: "lead", label: "Lead", render: "avatar", width: 180 },
      { key: "status", label: "Status", render: "status", width: 110 },
      { key: "progress", label: "Progress", align: "right", render: "bar", width: 150 },
      { key: "budgetUsed", label: "Budget Used", align: "right", render: "bar", width: 150 },
      { key: "profit", label: "Profit (₹M)", align: "right", render: "delta", width: 110 },
      { key: "hoursLogged", label: "Hours", align: "right", width: 100 },
      { key: "openTasks", label: "Open Tasks", align: "right", width: 110 },
      { key: "blockers", label: "Blockers", align: "right", width: 100 },
      { key: "due", label: "Due", align: "right", width: 120 },
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
      { key: "logged", label: "Logged", align: "right", width: 90 },
      { key: "health", label: "Health", align: "center", width: 90 },
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
  { label: "VS Code", value: 32, color: "#22c55e" },
  { label: "Slack", value: 18, color: "#22c55e" },
  { label: "Figma", value: 9, color: "#f59e0b" },
  { label: "Notion", value: 7, color: "#f59e0b" },
  { label: "Zoom", value: 5, color: "#ef4444" },
  { label: "Teams", value: 4, color: "#ef4444" },
];

/** Website Usage — horizontal bar list (executive overview). */
export const websitesUsage: BarListItem[] = [
  { label: "github.com", value: 14, color: "#22c55e" },
  { label: "google.com", value: 11, color: "#22c55e" },
  { label: "stackoverflow.com", value: 8, color: "#f59e0b" },
  { label: "linkedin.com", value: 6, color: "#f59e0b" },
  { label: "youtube.com", value: 5, color: "#ef4444" },
  { label: "figma.com", value: 4, color: "#ef4444" },
];

function usageClassFromColor(color?: string): "Productive" | "Neutral" | "Distracting" {
  if (color === "#22c55e" || color === "#10b981") return "Productive";
  if (color === "#ef4444") return "Distracting";
  return "Neutral";
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
      classification: usageClassFromColor(item.color),
      hours: `${round1(item.value * 0.42)}h`,
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
      classification: usageClassFromColor(item.color),
      hours: `${round1(item.value * 0.38)}h`,
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

/** Location & Work Mode — avg activity by working mode. */
export const activityByMode = {
  rows: [
    { label: "Office", percent: 50, value: "7.7 hrs/day" },
    { label: "Remote", percent: 74, value: "8.5 hrs/day" },
    { label: "Hybrid", percent: 30, value: "4.5 hrs/day" },
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
    const workedMins = Math.round(between(20, 480));
    const yesterdayMins = Math.round(workedMins * between(0.75, 1.2));
    const deltaMins = workedMins - yesterdayMins;
    const status = workedMins < 60 ? "Just started" : workedMins < 240 ? "In progress" : "On track";
    return {
      name: p.name,
      team: p.team,
      role: p.role,
      worked: formatHm(workedMins),
      vsYesterday: `${deltaMins >= 0 ? "+" : "−"}${formatHm(Math.abs(deltaMins))}`,
      firstClockIn: `${8 + Math.floor(between(0, 3))}:${String(Math.floor(between(0, 59))).padStart(2, "0")} AM`,
      status,
      health: workedMins >= 300 ? "good" : workedMins >= 120 ? "warn" : "bad",
    };
  }).sort((a, b) => String(b.worked).localeCompare(String(a.worked)));

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 180 },
      { key: "team", label: "Team", width: 110 },
      { key: "worked", label: "Worked Today", align: "right", width: 110 },
      { key: "vsYesterday", label: "vs Yesterday", align: "right", width: 120 },
      { key: "firstClockIn", label: "First Clock-in", align: "right", width: 110 },
      { key: "status", label: "Status", render: "status", width: 110 },
      { key: "health", label: "Health", align: "center", render: "health", width: 100 },
    ],
    rows,
  };
}

/** Today's Activity — activity / idle / away per member today. */
export function makeTodaysActivityTable(): DataTablePayload {
  const rows: TableRow[] = expandPeople(3).map((p) => {
    const activity = Math.round(between(18, 92));
    const idle = Math.round(between(0, 18));
    const away = Math.max(0, 100 - activity - idle);
    return {
      name: p.name,
      team: p.team,
      role: p.role,
      activity,
      idle,
      away,
      activeMins: formatHm(Math.round((activity / 100) * between(180, 420))),
      delta: Math.round(between(-12, 14)),
      health: healthFrom(activity, 60, 40),
    };
  }).sort((a, b) => Number(b.activity) - Number(a.activity));

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 120 },
      { key: "activity", label: "Activity", align: "right", render: "bar", width: 140 },
      { key: "idle", label: "Idle %", align: "right", width: 90 },
      { key: "away", label: "Away %", align: "right", width: 90 },
      { key: "activeMins", label: "Active Time", align: "right", width: 110 },
      { key: "delta", label: "vs Yday", align: "right", render: "delta", width: 90 },
      { key: "health", label: "Health", align: "center", render: "health", width: 90 },
    ],
    rows,
  };
}

/** Utilization Rate — billable vs capacity per member. */
export function makeUtilizationTable(): DataTablePayload {
  const rows: TableRow[] = expandPeople(3).map((p) => {
    const utilization = Math.round(between(42, 98));
    const billable = Math.round(utilization * between(0.7, 0.95));
    const nonBillable = Math.max(0, utilization - billable);
    const capacityHrs = 40;
    const workedHrs = round1((utilization / 100) * capacityHrs);
    return {
      name: p.name,
      team: p.team,
      role: p.role,
      utilization,
      billable,
      nonBillable,
      workedHrs,
      capacityHrs,
      health: healthFrom(utilization, 75, 60),
    };
  }).sort((a, b) => Number(b.utilization) - Number(a.utilization));

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 120 },
      { key: "utilization", label: "Utilization", align: "right", render: "bar", width: 140 },
      { key: "billable", label: "Billable %", align: "right", width: 100 },
      { key: "nonBillable", label: "Non-Billable %", align: "right", width: 120 },
      { key: "workedHrs", label: "Worked Hrs", align: "right", render: "hours", width: 110 },
      { key: "capacityHrs", label: "Capacity", align: "right", render: "hours", width: 100 },
      { key: "health", label: "Health", align: "center", render: "health", width: 90 },
    ],
    rows,
  };
}

/** Resource Bench — people currently available / on bench. */
export function makeBenchTable(): DataTablePayload {
  const benchPeople = expandPeople(2).filter((_, i) => i % 2 === 0).slice(0, 18);
  const rows: TableRow[] = benchPeople.map((p) => {
    const benchHrs = round1(between(8, 36));
    const daysOnBench = Math.floor(between(1, 18));
    const availability = pick(["Immediate", "This week", "Next sprint"]);
    return {
      name: p.name,
      team: p.team,
      role: p.role,
      benchHrs,
      daysOnBench,
      availability,
      health: daysOnBench > 10 ? "warn" : "good",
    };
  }).sort((a, b) => Number(b.benchHrs) - Number(a.benchHrs));

  return {
    columns: [
      { key: "name", label: "Member", pinned: true, render: "avatar", width: 190 },
      { key: "team", label: "Team", width: 120 },
      { key: "role", label: "Role", width: 180 },
      { key: "benchHrs", label: "Bench Hours", align: "right", render: "hours", width: 120 },
      { key: "daysOnBench", label: "Days on Bench", align: "right", width: 120 },
      { key: "availability", label: "Availability", render: "status", width: 120 },
      { key: "health", label: "Health", align: "center", render: "health", width: 90 },
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

