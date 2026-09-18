import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Lightweight hover/focus tooltip portaled to document.body so it is never
 * clipped by overflow-hidden parents (KPI cards, widget shells, drawers).
 */
export function Tooltip({
  content,
  children,
  className,
  wrapperClassName,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const id = React.useId();

  const reposition = React.useCallback((): void => {
    try {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 8;
      setCoords({
        top: side === "bottom" ? rect.bottom + gap : rect.top - gap,
        left: rect.left + rect.width / 2,
      });
    } catch {
      /* no-op */
    }
  }, [side]);

  const show = (): void => {
    try {
      reposition();
      setOpen(true);
    } catch {
      /* no-op */
    }
  };

  const hide = (): void => {
    try {
      setOpen(false);
    } catch {
      /* no-op */
    }
  };

  React.useLayoutEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  const fullWidth = Boolean(wrapperClassName);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn(fullWidth ? wrapperClassName : "inline-flex shrink-0")}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span
          className={cn(fullWidth && "block w-full min-w-0")}
          aria-describedby={open ? id : undefined}
        >
          {children}
        </span>
      </span>
      {open &&
        coords &&
        createPortal(
          <span
            role="tooltip"
            id={id}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: side === "bottom" ? "translateX(-50%)" : "translate(-50%, -100%)",
              zIndex: 50,
            }}
            className={cn(
              "pointer-events-none w-max max-w-[260px] rounded-md bg-ink px-2.5 py-1.5 text-[11px] font-medium leading-snug text-white shadow-pop animate-fade-in",
              className,
            )}
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  );
}
