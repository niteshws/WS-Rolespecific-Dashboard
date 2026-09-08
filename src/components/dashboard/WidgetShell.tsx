import * as React from "react";
import {
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Lock,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface EditControls {
  onHide: () => void;
  onGrow: () => void;
  onShrink: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/** Common frame for every Bento widget: header, drill action / edit controls, body. */
export function WidgetShell({
  title,
  subtitle,
  info,
  highlight,
  onOpenReport,
  actionLabel,
  editing,
  edit,
  children,
  className,
  bodyClassName,
  badge,
  hideHeader,
  locked,
}: {
  title: string;
  subtitle?: string;
  info?: string;
  highlight?: boolean;
  onOpenReport?: () => void;
  actionLabel?: string;
  editing?: boolean;
  edit?: EditControls;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  badge?: React.ReactNode;
  hideHeader?: boolean;
  locked?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden transition-all duration-300",
        highlight ? "border-primary/60 ring-2 ring-primary/20 shadow-card-hover" : "border-border",
        editing && "border-dashed border-primary/40",
        className,
      )}
    >
      {locked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-4 text-center">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <h4 className="mt-2 text-xs font-bold text-foreground">Upgrade Plan</h4>
          <p className="mt-1 text-[10px] text-muted-foreground max-w-[190px] leading-tight">
            Unlock timelines, screenshots, and advanced insights by upgrading your plan.
          </p>
          <button className="mt-3.5 rounded bg-primary px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-primary/90 transition-colors">
            Upgrade now
          </button>
        </div>
      )}
      {!hideHeader && (
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2">
          {editing && <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/60" />}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold tracking-tight text-ink">{title}</h3>
              {info && (
                <Tooltip content={info}>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-ink"
                    aria-label={info}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {editing && edit ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <IconBtn label="Move up" onClick={edit.onMoveUp}><ChevronUp className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn label="Move down" onClick={edit.onMoveDown}><ChevronDown className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn label="Shrink widget" onClick={edit.onShrink}><Minimize2 className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn label="Grow widget" onClick={edit.onGrow}><Maximize2 className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn label="Hide widget" onClick={edit.onHide}><EyeOff className="h-3.5 w-3.5" /></IconBtn>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            {badge}
            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="flex items-center gap-0.5 rounded px-1.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
                aria-label={`View detailed report for ${title}`}
              >
                {actionLabel
                  ? actionLabel
                  : ["task", "action", "screenshot"].some((t) => title.toLowerCase().includes(t))
                    ? "View all"
                    : "View report"}
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
      )}
      <div className={cn("min-h-0 flex-1 flex flex-col p-5", bodyClassName)}>{children}</div>
    </Card>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded p-1 text-muted hover:bg-muted/10 hover:text-ink"
    >
      {children}
    </button>
  );
}

/** Placeholder shown in edit mode for a hidden widget so it can be restored. */
export function HiddenWidgetCard({ title, onRestore }: { title: string; onRestore: () => void }) {
  return (
    <Card className="flex h-full flex-col items-center justify-center gap-2 border-dashed border-muted/40 bg-muted/[0.03] p-4">
      <EyeOff className="h-5 w-5 text-muted-foreground/50" />
      <p className="text-center text-xs text-muted-foreground">{title}</p>
      <button
        onClick={onRestore}
        className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
      >
        <Eye className="h-3 w-3" />
        Show
      </button>
    </Card>
  );
}
