import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight hover/focus tooltip. Not a full Radix port — just enough for a
 * prototype, but keyboard-accessible via focus and aria-describedby.
 */
export function Tooltip({
  content,
  children,
  className,
  wrapperClassName,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  return (
    <span
      className={cn("relative inline-flex", wrapperClassName)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className="w-full" aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] font-medium text-white shadow-pop animate-fade-in",
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
