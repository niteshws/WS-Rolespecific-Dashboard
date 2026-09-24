import * as React from "react";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  icon?: React.ReactNode;
}

export function AnnouncementModal({
  open,
  onOpenChange,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  icon,
}: AnnouncementModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md scale-100 overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-pop transition-all animate-scale-in dark:bg-zinc-900 mx-4"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5 self-center h-20 w-20">
            {icon || <Sparkles className="h-10 w-10" />}
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            {title}
          </h2>
          
          <div className="mt-3 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            {description}
          </div>

          <button
            onClick={() => {
              onPrimaryAction();
              onOpenChange(false);
            }}
            className="mt-8 flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(93,43,255,0.25)] transition-all hover:translate-y-[-1px] hover:bg-[#4d1fe0] hover:shadow-[0_6px_16px_rgba(93,43,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
