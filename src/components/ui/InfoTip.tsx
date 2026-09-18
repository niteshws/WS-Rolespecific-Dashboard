import { Info } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Info icon with a plain-language tooltip. Stops click propagation for card buttons. */
export function InfoTip({
  content,
  className,
  side = "bottom",
}: {
  content: string;
  className?: string;
  side?: "top" | "bottom";
}) {
  return (
    <Tooltip
      content={content}
      side={side}
      className="max-w-[240px] whitespace-normal text-left normal-case tracking-normal"
    >
      <button
        type="button"
        className={cn(
          "shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-ink",
          className,
        )}
        aria-label={content}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  );
}
