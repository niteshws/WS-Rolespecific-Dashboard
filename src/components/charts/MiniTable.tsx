import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import type { DataTablePayload, TableColumn, TableRow } from "@/types";

/** Layer 2 — compact, scrollable read-only table embedded in the grid. */
export function MiniTable({ payload }: { payload: DataTablePayload }) {
  const { columns, rows } = payload;
  return (
    <div className="thin-scrollbar h-full overflow-auto">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "border-b border-border bg-card px-2 py-1.5 text-left font-medium text-muted-foreground",
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
                    "border-b border-border/60 px-2 py-1.5 text-ink",
                    c.align === "right" && "text-right tabular",
                    c.align === "center" && "text-center",
                  )}
                >
                  <MiniCell col={c} row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniCell({ col, row }: { col: TableColumn; row: TableRow }) {
  const v = row[col.key];
  switch (col.render) {
    case "avatar":
      return (
        <span className="flex items-center gap-2">
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
          className="inline-flex items-center justify-end rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
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
        <span className="flex items-center justify-end gap-2">
          <span className="tabular w-9 text-right">{n}%</span>
          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted/10">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, n)}%` }} />
          </span>
        </span>
      );
    }
    default:
      return <span className="truncate">{v}</span>;
  }
}
