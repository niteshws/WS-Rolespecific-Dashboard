import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Right-side slide-over. Closes on overlay click or Escape. */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  headerAccent,
  headerRight,
  children,
  footer,
  widthClass = "w-full max-w-3xl",
  contentClassName,
  headerClassName,
  footerClassName,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAccent?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    // App scrolls on <main>, not <body> — lock both so the drawer owns scroll.
    const main = document.querySelector("main");
    const prevBodyOverflow = document.body.style.overflow;
    const prevMainOverflow = main instanceof HTMLElement ? main.style.overflow : "";
    document.body.style.overflow = "hidden";
    if (main instanceof HTMLElement) main.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBodyOverflow;
      if (main instanceof HTMLElement) main.style.overflow = prevMainOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "Panel"}>
      <div
        className="absolute inset-0 bg-ink/40 animate-fade-in"
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full flex-col overscroll-contain bg-white shadow-[0_8px_40px_rgba(15,10,46,0.12)]",
          "translate-x-0 animate-[slide-in_0.25s_ease-out]",
          widthClass,
        )}
        style={{ animationName: "slide-in" }}
      >
        <style>{`@keyframes slide-in{from{transform:translateX(24px);opacity:.6}to{transform:translateX(0);opacity:1}}`}</style>
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-4 border-b border-[#e5e7eb] px-5 py-4",
            headerClassName,
          )}
        >
          <div className="min-w-0">
            {headerAccent}
            {title ? (
              typeof title === "string" ? (
                <h2 className="text-base font-semibold text-ink">{title}</h2>
              ) : (
                title
              )
            ) : null}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerRight}
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="grid h-8 w-8 place-items-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          className={cn(
            "thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",
            contentClassName,
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className={cn("shrink-0 border-t border-[#e5e7eb] px-5 py-4", footerClassName)}>{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
