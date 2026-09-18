import { TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import type { DataTablePayload, TableColumn, TableRow } from "@/types";

/** Layer 2 — compact, scrollable read-only table embedded in the grid. */
export function MiniTable({ payload }: { payload: DataTablePayload }) {
  const { columns, rows, insight } = payload;
  const isMilestones = columns.some((c) => c.key === "milestone");

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="thin-scrollbar min-h-0 flex-1 overflow-auto">
        <table className={cn("w-full border-collapse", isMilestones ? "text-[11px]" : "text-xs")}>
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "border-b border-border bg-card text-left font-medium text-muted-foreground",
                    isMilestones ? "px-2 py-1" : "px-2 py-1.5",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-primary/[0.03]">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "border-b border-border/50 text-ink",
                      isMilestones ? "px-2 py-1" : "px-2 py-1.5",
                      c.align === "right" && "text-right tabular",
                      c.align === "center" && "text-center",
                    )}
                  >
                    <MiniCell col={c} row={row} compact={isMilestones} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {insight && (
        <div className="flex shrink-0 items-start gap-2 rounded-xl bg-sky-50/90 px-3 py-2.5">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-600">{insight}</p>
        </div>
      )}
    </div>
  );
}

function MiniCell({
  col,
  row,
  compact,
}: {
  col: TableColumn;
  row: TableRow;
  compact?: boolean;
}) {
  const v = row[col.key];
  switch (col.render) {
    case "avatar":
      return (
        <span className="flex gap-2">
          <Avatar name={String(v)} size={20} />
          <span className="truncate font-medium">{v}</span>
        </span>
      );
    case "status":
      return <Badge variant={statusVariant(String(v))}>{v}</Badge>;
    case "hours":
      return <span>{v}h</span>;
    case "delta": {
      const n = Number(v);
      return (
        <span
          className="inline-flex justify-end rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
          style={{ background: n >= 0 ? "#0ea5e9" : "#374151" }}
        >
          {n >= 0 ? "+" : ""}
          {n}%
        </span>
      );
    }
    case "bar": {
      const n = Number(v);
      return (
        <span className="flex justify-end gap-2">
          <span className="tabular w-9 text-right">{n}%</span>
          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted/10">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, n)}%` }} />
          </span>
        </span>
      );
    }
    default: {
      const text = String(v ?? "");
      if (col.key === "project") {
        return <span className="block truncate text-muted-foreground">{text}</span>;
      }
      if (col.key === "milestone") {
        return (
          <Tooltip content={text} side="bottom">
            <span
              className={cn(
                "block max-w-full cursor-default truncate font-medium text-ink",
                compact && "text-[11px]",
              )}
              tabIndex={0}
            >
              {text}
            </span>
          </Tooltip>
        );
      }
      if (col.key === "progress") {
        return <span className="whitespace-nowrap tabular text-ink">{text}</span>;
      }
      return <span className="truncate">{text}</span>;
    }
  }
}
