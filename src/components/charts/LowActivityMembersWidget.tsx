import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { LowActivityMemberRow, LowActivityMembersPayload } from "@/types";

type SortKey = keyof LowActivityMemberRow;

/** Layer 2 — members with low activity; table chrome matches Workforce Ledger. */
export function LowActivityMembersWidget({ payload }: { payload: LowActivityMembersPayload }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    if (!sortKey) return payload.rows;
    return [...payload.rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [payload.rows, sortKey, sortDir]);

  const toggleSort = (key: SortKey): void => {
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

  const headers: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "name", label: "Member" },
    { key: "project", label: "Project" },
    { key: "activity", label: "Activity", align: "right" },
    { key: "idle", label: "Idle", align: "right" },
  ];

  return (
    <div className="thin-scrollbar h-full min-h-0 overflow-auto border-t border-border">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-20">
          <tr>
            {headers.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "border-b border-border bg-[#f7f8fa] px-3 py-2 font-semibold text-muted",
                  col.align === "right" ? "text-right" : "text-left",
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
          {rows.map((row, ri) => (
            <tr key={row.name} className={cn("group hover:bg-primary/[0.03]", ri % 2 === 1 && "bg-muted/[0.03]")}>
              <td className="border-b border-border/60 px-3 py-2 text-ink">
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={row.name} size={22} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{row.name}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{row.department}</span>
                  </span>
                </span>
              </td>
              <td className="border-b border-border/60 px-3 py-2 text-ink">
                <span className="truncate">{row.project}</span>
              </td>
              <td className="border-b border-border/60 px-3 py-2 text-right tabular text-health-bad">
                {row.activity}%
              </td>
              <td className="border-b border-border/60 px-3 py-2 text-right tabular text-ink">{row.idle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
