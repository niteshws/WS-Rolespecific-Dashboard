import type { HealthLevel } from "@/types";

type Variant = "neutral" | HealthLevel;

/** Project status colors — matches Projects Worked widget bars. */
export const PROJECT_STATUS_COLORS: Record<string, string> = {
  "Not Started": "#6B7280",
  "In Progress": "#F59E0B",
  "Yet to Start": "#0EA5E9",
  "On Hold": "#8B5CF6",
  Cancelled: "#EF4444",
  Completed: "#10B981",
};

/** Soft pill fill + text for status badges (Status column reference). */
export const PROJECT_STATUS_PILL: Record<string, { text: string; bg: string }> = {
  "Not Started": { text: "#6B7280", bg: "#F3F4F6" },
  "In Progress": { text: "#D97706", bg: "#FEF3C7" },
  "Yet to Start": { text: "#0284C7", bg: "#E0F2FE" },
  "On Hold": { text: "#7C3AED", bg: "#EDE9FE" },
  Cancelled: { text: "#DC2626", bg: "#FEE2E2" },
  Completed: { text: "#059669", bg: "#D1FAE5" },
  "On Budget": { text: "#059669", bg: "#ECFDF5" },
  "At Risk": { text: "#D97706", bg: "#FFFBEB" },
  "Over Budget": { text: "#DC2626", bg: "#FEF2F2" },
  "Under Budget": { text: "#0284C7", bg: "#E0F2FE" },
  PTO: { text: "#0369A1", bg: "#E0F2FE" },
  Sick: { text: "#BE123C", bg: "#FFE4E6" },
  Casual: { text: "#B45309", bg: "#FEF3C7" },
  Pending: { text: "#6B7280", bg: "#F3F4F6" },
  Approved: { text: "#059669", bg: "#ECFDF5" },
  Rejected: { text: "#DC2626", bg: "#FEE2E2" },
  "On Time": { text: "#059669", bg: "#D1FAE5" },
  Absent: { text: "#BE123C", bg: "#FFE4E6" },
  "Not In Yet": { text: "#6B7280", bg: "#F3F4F6" },
  Heavy: { text: "#D97706", bg: "#FEF3C7" },
  "Under-utilized": { text: "#0284C7", bg: "#E0F2FE" },
  "Over-allocated": { text: "#B91C1C", bg: "#FEE2E2" },
  Healthy: { text: "#059669", bg: "#ECFDF5" },
  Optimal: { text: "#059669", bg: "#ECFDF5" },
  "Over-utilized": { text: "#DC2626", bg: "#FEE2E2" },
  "High load": { text: "#DC2626", bg: "#FEE2E2" },
  Balanced: { text: "#059669", bg: "#ECFDF5" },
  "Light load": { text: "#0284C7", bg: "#E0F2FE" },
};

export function projectStatusColor(status: string): string | undefined {
  return PROJECT_STATUS_COLORS[status] ?? PROJECT_STATUS_COLORS[status.trim()];
}

export function projectStatusPill(status: string): { text: string; bg: string } | undefined {
  const trimmed = status.trim();
  if (trimmed.startsWith("Late")) {
    return { text: "#DC2626", bg: "#FEE2E2" };
  }
  return PROJECT_STATUS_PILL[status] ?? PROJECT_STATUS_PILL[trimmed];
}

const GOOD = new Set(["paid", "on track", "good", "healthy", "productive", "in progress", "completed", "on budget", "under budget", "approved", "on time"]);
const WARN = new Set([
  "pending",
  "at risk",
  "due tomorrow",
  "warn",
  "watch",
  "not in yet",
  "triage",
  "neutral",
  "draft",
  "under-utilized",
  "under utilized",
  "not started",
  "yet to start",
  "on hold",
]);
const BAD = new Set([
  "overdue",
  "delayed",
  "absent",
  "bad",
  "at risk",
  "distracting",
  "cancelled",
  "over-allocated",
  "over allocated",
  "over budget",
  "rejected",
  "late",
]);

/** Map an arbitrary status string to a Badge variant. */
export function statusVariant(value: string): Variant {
  const v = value.trim().toLowerCase();
  if (GOOD.has(v)) return "good";
  if (BAD.has(v)) return "bad";
  if (WARN.has(v)) return "warn";
  // A clock time (e.g. "09:20:22") reads as present → healthy.
  if (/^\d{1,2}:\d{2}/.test(v)) return "good";
  return "neutral";
}
