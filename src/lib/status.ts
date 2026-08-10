import type { HealthLevel } from "@/types";

type Variant = "neutral" | HealthLevel;

const GOOD = new Set(["paid", "on track", "good", "healthy", "productive", "in progress"]);
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
]);
const BAD = new Set(["overdue", "delayed", "absent", "bad", "at risk", "distracting", "cancelled"]);

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
