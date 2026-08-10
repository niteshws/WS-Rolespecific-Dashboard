import * as React from "react";
import { cn } from "@/lib/utils";
import type { HealthLevel } from "@/types";

type BadgeVariant = "neutral" | "primary" | HealthLevel;

const styles: Record<BadgeVariant, string> = {
  neutral: "bg-muted/10 text-muted border-muted/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  good: "bg-health-good/10 text-health-good border-health-good/25",
  warn: "bg-health-warn/10 text-[#b45309] border-health-warn/25",
  bad: "bg-health-bad/10 text-health-bad border-health-bad/25",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
