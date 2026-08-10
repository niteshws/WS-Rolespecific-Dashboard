import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search, ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import { fmt } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import type { DataTablePayload, TableColumn, TableRow } from "@/types";

const HEALTH_VARIANT: Record<string, "good" | "warn" | "bad"> = {
  good: "good",
  warn: "warn",
  bad: "bad",
  "On Track": "good",
  "At Risk": "warn",
  Delayed: "bad",
};

function healthValueVariant(v: string): "good" | "warn" | "bad" {
  return HEALTH_VARIANT[v] ?? "warn";
}

/**
 * Layer 3 — "The Report". A dense, itemized table with a pinned lead column,
 * client-side sorting, a text filter, and CSV export. Horizontally scrollable
 * so it can carry many columns without breaking the Bento grid.
 */
export function DataTable({
  payload,
  title = "work-intelligence-report",
  subtitle,
  showExport = true,
  onOpenReport,
  isEditing,
}: {
  payload: DataTablePayload;
  title?: string;
  subtitle?: string;
  showExport?: boolean;
  onOpenReport?: () => void;
  isEditing?: boolean;
}) {
  const { columns, rows } = payload;
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q) {
      out = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (sortKey) {
      out = [...out].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, query, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCsv() {
    downloadCsv(columns, filtered, title);
  }

  return (
    <div className="flex h-full flex-col">
      {/* toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-3">
        {/* Left side: Title and Subtitle */}
        {!isEditing && title && (
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold tracking-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        
        {/* Right side: Controls */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {filtered.length} of {rows.length} rows
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter rows…"
              aria-label="Filter table rows"
              className="h-8 w-48 rounded border border-border bg-card pl-7 pr-2 text-xs text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
            />
          </div>
          {showExport && (
            <Button variant="outline" size="sm" onClick={exportCsv} className="whitespace-nowrap h-8 text-xs font-medium px-3">
              <Download className="h-3.5 w-3.5 mr-1" />
              Export CSV
            </Button>
          )}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-0.5 rounded px-2 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10 whitespace-nowrap"
            >
              {title?.toLowerCase().includes("timesheet") || title?.toLowerCase().includes("screenshot") ? "View details" : "View report"}
              <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* scroll region */}
      <div className="thin-scrollbar min-h-0 flex-1 overflow-auto border-t border-border">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-20">
            <tr>
              {columns.map((col, ci) => (
                <th
                  key={col.key}
                  style={{ minWidth: col.width }}
                  className={cn(
                    "border-b border-border bg-[#f7f8fa] px-3 py-2 font-semibold text-muted",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.pinned &&
                      "sticky left-0 z-30 bg-[#f7f8fa] shadow-[2px_0_0_0_rgba(55,65,81,0.08)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink",
                      col.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-primary" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-xs text-muted-foreground">
                  No rows match “{query}”.
                </td>
              </tr>
            )}
            {filtered.map((row, ri) => (
              <tr key={ri} className="group hover:bg-primary/[0.03]">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ minWidth: col.width }}
                    className={cn(
                      "border-b border-border/60 px-3 py-2 text-ink",
                      col.align === "right" && "text-right tabular",
                      col.align === "center" && "text-center",
                      col.pinned &&
                        "sticky left-0 z-10 bg-card group-hover:bg-[#fbf9ff] shadow-[2px_0_0_0_rgba(55,65,81,0.06)]",
                    )}
                  >
                    <Cell col={col} row={row} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ col, row }: { col: TableColumn; row: TableRow }) {
  const value = row[col.key];

  switch (col.render) {
    case "avatar":
      return (
        <span className="flex items-center gap-2">
          <Avatar name={String(value)} size={22} />
          <span className="truncate font-medium">{value}</span>
        </span>
      );
    case "health":
      return (
        <Badge variant={healthValueVariant(String(value))}>
          {typeof value === "string" && isNaN(Number(value))
            ? value
            : String(value) === "good"
              ? "Healthy"
              : String(value) === "warn"
                ? "Watch"
                : "At risk"}
        </Badge>
      );
    case "status":
      return <Badge variant={statusVariant(String(value))}>{value}</Badge>;
    case "money":
      return <span>₹{fmt(Number(value))}</span>;
    case "hours":
      return <span>{value}h</span>;
    case "delta": {
      const n = Number(value);
      return (
        <span className={n >= 0 ? "text-health-good" : "text-health-bad"}>
          {n >= 0 ? "+" : ""}
          {n}%
        </span>
      );
    }
    case "bar": {
      const n = Number(value);
      const color = n >= 75 ? "#10b981" : n >= 55 ? "#f59e0b" : "#ef4444";
      return (
        <span className="flex items-center justify-end gap-2">
          <span className="tabular w-8 text-right">{n}%</span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/10">
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.min(100, n)}%`, background: color }}
            />
          </span>
        </span>
      );
    }
    default:
      return <span className="truncate">{value}</span>;
  }
}
