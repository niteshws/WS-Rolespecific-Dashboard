import type { TableColumn, TableRow } from "@/types";

/** Escape a single CSV field (RFC-4180: quote, and double internal quotes). */
function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Build a CSV string from typed table columns + rows. Uses the human-readable
 * column labels as the header so the export matches what the user sees.
 */
export function toCsv(columns: TableColumn[], rows: TableRow[]): string {
  const header = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(r[c.key])).join(",")).join("\r\n");
  return `${header}\r\n${body}`;
}

/** Slugify a report/table title into a safe filename stem. */
export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "report"
  );
}

/** Trigger a client-side CSV download. No data leaves the browser. */
export function downloadCsv(columns: TableColumn[], rows: TableRow[], title: string) {
  const csv = toCsv(columns, rows);
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(title)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
