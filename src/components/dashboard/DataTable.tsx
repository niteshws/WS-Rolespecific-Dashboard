import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search, ArrowUpRight, ChevronDown } from "lucide-react";
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

const DEFAULT_PAGE_SIZE = 8;

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
  pageSize = DEFAULT_PAGE_SIZE,
  fillHeight = true,
  contentAlign = "auto",
}: {
  payload: DataTablePayload;
  title?: string;
  subtitle?: string;
  showExport?: boolean;
  onOpenReport?: () => void;
  isEditing?: boolean;
  /** Rows shown before Load more. Pass 0 to show all. */
  pageSize?: number;
  /** When false, table height hugs rows (no empty stretch). */
  fillHeight?: boolean;
  /** Force all cells left-aligned (report drawers). */
  contentAlign?: "auto" | "left";
}) {
  const { columns, rows } = payload;
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize > 0 ? pageSize : rows.length);
  const forceLeft = contentAlign === "left";

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

  useEffect(() => {
    setVisibleCount(pageSize > 0 ? pageSize : filtered.length);
  }, [query, sortKey, sortDir, pageSize, filtered.length]);

  const visibleRows = pageSize > 0 ? filtered.slice(0, visibleCount) : filtered;
  const hasMore = pageSize > 0 && visibleCount < filtered.length;
  const remaining = Math.max(0, filtered.length - visibleCount);

  const toggleSort = (key: string): void => {
    try {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    } catch {
      /* no-op */
    }
  };

  const exportCsv = (): void => {
    try {
      downloadCsv(columns, filtered, title);
    } catch {
      /* no-op */
    }
  };

  const loadMore = (): void => {
    try {
      setVisibleCount((count) => Math.min(filtered.length, count + pageSize));
    } catch {
      /* no-op */
    }
  };

  return (
    <div className={cn("flex flex-col", fillHeight ? "h-full min-h-0" : "h-auto")}>
      {/* toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-3 pt-3">
        {!isEditing && title && (
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold tracking-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
            {visibleRows.length} of {filtered.length} rows
            {filtered.length !== rows.length ? ` · ${rows.length} total` : ""}
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
            <Button variant="outline" size="sm" onClick={exportCsv} className="h-8 whitespace-nowrap px-3 text-xs font-medium">
              <Download className="mr-1 h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-0.5 whitespace-nowrap rounded px-2 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {title?.toLowerCase().includes("timesheet") || title?.toLowerCase().includes("screenshot")
                ? "View details"
                : "View report"}
              <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* scroll region — only stretch when filling a fixed-height parent */}
      <div
        className={cn(
          "border-t border-border",
          fillHeight ? "thin-scrollbar min-h-0 flex-1 overflow-auto" : "overflow-x-auto",
        )}
      >
        <table
          className="w-full border-collapse text-xs"
          style={{ minWidth: columns.reduce((sum, col) => sum + (col.width ?? 120), 0) }}
        >
          <thead className="sticky top-0 z-20">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, minWidth: col.width }}
                  className={cn(
                    "border-b border-border bg-[#f7f8fa] px-3 py-2 text-left font-semibold text-muted",
                    col.pinned &&
                      "sticky left-0 z-30 bg-[#f7f8fa] shadow-[2px_0_0_0_rgba(55,65,81,0.08)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-ink"
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
            {visibleRows.map((row, ri) => (
              <tr key={ri} className={cn("group hover:bg-primary/[0.03]", ri % 2 === 1 && "bg-muted/[0.03]")}>
                {columns.map((col) => {
                  const align = forceLeft ? "left" : col.align;
                  return (
                  <td
                    key={col.key}
                    style={{ width: col.width, minWidth: col.width }}
                    className={cn(
                      "border-b border-border/60 px-3 py-2.5 text-ink",
                      align === "right" && "text-right tabular",
                      align === "center" && "text-center",
                      col.pinned &&
                        "sticky left-0 z-10 bg-card group-hover:bg-[#fbf9ff] shadow-[2px_0_0_0_rgba(55,65,81,0.06)]",
                    )}
                  >
                    <Cell col={col} row={row} forceLeft={forceLeft} />
                  </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex shrink-0 items-center justify-center border-t border-border bg-card px-4 py-2.5">
          <Button variant="outline" size="sm" onClick={loadMore} className="h-8 gap-1.5 text-xs font-medium">
            Load more
            <ChevronDown className="h-3.5 w-3.5" />
            <span className="text-muted-foreground">({remaining} remaining)</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function Cell({
  col,
  row,
  forceLeft = false,
}: {
  col: TableColumn;
  row: TableRow;
  forceLeft?: boolean;
}) {
  const value = row[col.key];
  const alignRight = !forceLeft && col.align === "right";

  switch (col.render) {
    case "avatar":
      return (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={String(value)} size={24} className="rounded-full" />
          <span className="truncate font-medium">{value}</span>
        </span>
      );
    case "health": {
      const raw = String(value);
      const label =
        raw === "good" ? "Healthy" : raw === "warn" ? "Watch" : raw === "bad" ? "At risk" : raw;
      return (
        <Badge variant={healthValueVariant(raw)} className="whitespace-nowrap">
          {label}
        </Badge>
      );
    }
    case "status": {
      const label = String(value);
      if (label === "Under-utilized") {
        return (
          <span className="inline-flex items-center rounded border border-[#0ea5e9]/25 bg-[#0ea5e9]/10 px-1.5 py-0.5 text-[11px] font-medium leading-none text-[#0284c7] whitespace-nowrap">
            {label}
          </span>
        );
      }
      return <Badge variant={statusVariant(label)}>{label}</Badge>;
    }
    case "bandPct": {
      const n = Number(value);
      const band = String(row.band ?? "");
      const tone =
        band === "Over-allocated"
          ? "text-health-bad"
          : band === "Healthy"
            ? "text-health-good"
            : band === "Under-utilized"
              ? "text-[#0284c7]"
              : "text-ink";
      return <span className={cn("tabular font-medium", tone)}>{n.toFixed(2)}%</span>;
    }
    case "money":
      return <span className="tabular">₹{fmt(Number(value))}</span>;
    case "hours":
      return <span className="tabular">{value}h</span>;
    case "delta": {
      const n = Number(value);
      return (
        <span className={cn("tabular", n >= 0 ? "text-health-good" : "text-health-bad")}>
          {n >= 0 ? "+" : ""}
          {n}%
        </span>
      );
    }
    case "bar": {
      const n = Number(value);
      const color = n >= 75 ? "#10b981" : n >= 55 ? "#f59e0b" : "#ef4444";
      return (
        <span className={cn("flex items-center gap-2", alignRight ? "justify-end" : "justify-start")}>
          <span className={cn("tabular w-8", alignRight ? "text-right" : "text-left")}>{n}%</span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/10">
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.min(100, n)}%`, background: color }}
            />
          </span>
        </span>
      );
    }
    default: {
      const text = String(value ?? "");
      const isSignedTime = /^[+\-−]/.test(text) && /h\s*\d*m/.test(text);
      if (isSignedTime) {
        const positive = text.startsWith("+");
        return (
          <span className={cn("whitespace-nowrap tabular", positive ? "text-health-good" : "text-health-bad")}>
            {text}
          </span>
        );
      }
      return <span className="truncate tabular">{value}</span>;
    }
  }
}
