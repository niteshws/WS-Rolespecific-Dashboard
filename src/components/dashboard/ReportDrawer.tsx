import { Sparkles, Download } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "./DataTable";
import { ScatterChart } from "@/components/charts/ScatterChart";
import { AxisChart } from "@/components/charts/AxisChart";
import { cn } from "@/lib/utils";
import { getReport } from "@/data/reports";
import { downloadCsv } from "@/lib/csv";
import type { AxisChartPayload, HealthLevel, ScatterPoint } from "@/types";

const HEALTH_DOT: Record<string, string> = {
  good: "bg-health-good",
  warn: "bg-health-warn",
  bad: "bg-health-bad",
};

/**
 * Layer 3 — "The Report". A slide-over that any KPI, insight, or widget opens
 * into. Bundles a narrative, summary stats, a context chart, and the dense
 * itemized table. Scroll height matches content — no empty stretch regions.
 */
export function ReportDrawer({
  reportKey,
  open,
  onClose,
}: {
  reportKey: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const report = getReport(reportKey ?? undefined);
  const sev = (report.severity ?? "good") as HealthLevel;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      widthClass="w-full max-w-5xl"
      headerAccent={
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">
            Report
          </span>
          <Badge variant={sev}>
            <span className={cn("h-1.5 w-1.5 rounded-full", HEALTH_DOT[sev])} />
            {sev === "good" ? "Healthy" : sev === "warn" ? "Needs attention" : "Critical"}
          </Badge>
        </div>
      }
      title={report.title}
      subtitle={report.subtitle}
      headerRight={
        <Button size="sm" onClick={() => downloadCsv(report.table.columns, report.table.rows, report.title)}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded border border-primary/20 bg-primary/[0.04] p-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-ink">{report.narrative}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {report.stats.map((s) => (
            <div key={s.label} className="rounded border border-border bg-card p-3">
              <div className="flex items-center gap-1.5">
                {s.health && <span className={cn("h-1.5 w-1.5 rounded-full", HEALTH_DOT[s.health])} />}
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
              </div>
              <div className="tabular mt-1 text-lg font-semibold text-ink">{s.value}</div>
              {s.delta && (
                <div
                  className={cn(
                    "mt-0.5 text-[10px] font-medium",
                    s.health === "bad" ? "text-health-bad" : s.health === "good" ? "text-health-good" : "text-muted",
                  )}
                >
                  {s.delta}
                </div>
              )}
            </div>
          ))}
        </div>

        {report.chart && (
          <div className="overflow-hidden rounded border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold text-ink">{report.chart.title}</div>
            <div className="h-[240px] w-full">
              {report.chart.type === "scatter" ? (
                <ScatterChart points={report.chart.payload as ScatterPoint[]} />
              ) : (
                <AxisChart payload={report.chart.payload as AxisChartPayload} />
              )}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded border border-border bg-card">
          <DataTable
            payload={report.table}
            title="Itemized detail"
            showExport={false}
            pageSize={10}
            fillHeight={false}
            contentAlign="left"
          />
        </div>
      </div>
    </Sheet>
  );
}
