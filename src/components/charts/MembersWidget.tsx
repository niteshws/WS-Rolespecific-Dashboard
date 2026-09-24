import { useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { MembersPayload } from "@/types";

type SegmentTooltip = {
  label: string;
  x: number;
  y: number;
};

const STATUS = [
  {
    key: "Online",
    field: "online" as const,
    color: "#0ea5e9",
  },
  {
    key: "Offline",
    field: "offline" as const,
    color: "#e5e7eb",
  },
  {
    key: "On Leave",
    field: "onLeave" as const,
    color: "#f59e0b",
  },
] as const;

const PlatformIcon = ({ name }: { name: string }) => {
  const cls = "h-3.5 w-3.5 shrink-0";
  switch (name) {
    case "Android":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path
            fill="#3DDC84"
            d="M17.523 15.3414C17.523 16.0591 18.1047 16.6414 18.8214 16.6414C19.5381 16.6414 20.1198 16.0591 20.1198 15.3414V10.4841C20.1198 9.76641 19.5381 9.18414 18.8214 9.18414C18.1047 9.18414 17.523 9.76641 17.523 10.4841V15.3414ZM3.88022 15.3414C3.88022 16.0591 4.46195 16.6414 5.17866 16.6414C5.89537 16.6414 6.4771 16.0591 6.4771 15.3414V10.4841C6.4771 9.76641 5.89537 9.18414 5.17866 9.18414C4.46195 9.18414 3.88022 9.76641 3.88022 10.4841V15.3414ZM16.7834 8.24141L18.2174 5.72241C18.3254 5.53341 18.2594 5.29041 18.0704 5.18241C17.8814 5.07441 17.6384 5.14041 17.5304 5.32941L16.0574 7.90841C14.8094 7.32141 13.4234 6.99141 11.9624 6.99141C10.5014 6.99141 9.11541 7.32141 7.86741 7.90841L6.39441 5.32941C6.28641 5.14041 6.04341 5.07441 5.85441 5.18241C5.66541 5.29041 5.59941 5.53341 5.70741 5.72241L7.14141 8.24141C4.71741 9.71541 3.09941 12.3234 3.09941 15.3014H20.8994C20.8994 12.3234 19.2814 9.71541 16.7834 8.24141ZM9.50041 12.8414C8.94741 12.8414 8.50041 12.3944 8.50041 11.8414C8.50041 11.2884 8.94741 10.8414 9.50041 10.8414C10.0534 10.8414 10.5004 11.2884 10.5004 11.8414C10.5004 12.3944 10.0534 12.8414 9.50041 12.8414ZM14.5004 12.8414C13.9474 12.8414 13.5004 12.3944 13.5004 11.8414C13.5004 11.2884 13.9474 10.8414 14.5004 10.8414C15.0534 10.8414 15.5004 11.2884 15.5004 11.8414C15.5004 12.3944 15.0534 12.8414 14.5004 12.8414Z"
          />
        </svg>
      );
    case "iOS":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path
            fill="#374151"
            d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
          />
        </svg>
      );
    case "Windows":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="#0ea5e9" d="M3 5.54 10.99 4.5v7.01H3V5.54Zm8.51-.15 9.49-1.34v8.5h-9.49V5.39ZM3 13.47h7.99v7.04L3 19.44v-5.97Zm8.51.01h9.49v8.48l-9.49-1.33v-7.15Z" />
        </svg>
      );
    case "MacOS":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path
            fill="#0ea5e9"
            d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
          />
        </svg>
      );
    case "Linux":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path
            fill="#374151"
            d="M12.504 2c-1.2.03-2.292.78-2.76 1.92-.24.6-.3 1.26-.24 1.92-.96.36-1.62 1.2-1.8 2.22-.3 1.5.24 3.06 1.38 3.9-.36.96-.48 1.98-.36 3 .24 2.1 1.5 3.9 3.24 4.74l-.48 1.86c-.24.96.36 1.86 1.26 1.86h1.56c.9 0 1.5-.9 1.26-1.86l-.48-1.86c1.74-.84 3-2.64 3.24-4.74.12-1.02 0-2.04-.36-3 1.14-.84 1.68-2.4 1.38-3.9-.18-1.02-.84-1.86-1.8-2.22.06-.66 0-1.32-.24-1.92C15.696 2.58 14.304 1.98 12.9 2h-.396Zm-1.92 4.8c.36 0 .66.3.66.66s-.3.66-.66.66-.66-.3-.66-.66.3-.66.66-.66Zm3.72 0c.36 0 .66.3.66.66s-.3.66-.66.66-.66-.3-.66-.66.3-.66.66-.66Z"
          />
        </svg>
      );
    case "Web":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8.25" stroke="#8b5cf6" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="3.5" ry="8.25" stroke="#8b5cf6" strokeWidth="1.4" />
          <path d="M4 12h16" stroke="#8b5cf6" strokeWidth="1.4" />
        </svg>
      );
    default:
      return <span className="h-3.5 w-3.5 rounded-sm bg-muted" />;
  }
};

/** Layer 2 — presence donut + members-by-platform grid. */
export function MembersWidget({ payload }: { payload: MembersPayload }) {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [segmentTooltip, setSegmentTooltip] = useState<SegmentTooltip | null>(null);

  const statuses = STATUS.map((s) => ({
    ...s,
    value: payload[s.field],
  }));

  const total = Math.max(payload.total, 1);
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;

  const showSegmentTooltip = (key: string, pct: number, value: number, x: number, y: number): void => {
    setHoveredStatus(key);
    setSegmentTooltip({
      label: `${pct}% · ${value} members`,
      x,
      y,
    });
  };

  const moveSegmentTooltip = (event: MouseEvent<SVGCircleElement>): void => {
    setSegmentTooltip((current) =>
      current ? { ...current, x: event.clientX, y: event.clientY } : null,
    );
  };

  const hideSegmentTooltip = (): void => {
    setHoveredStatus(null);
    setSegmentTooltip(null);
  };

  return (
    <div className="flex h-full min-h-0 items-stretch gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative aspect-square h-full max-h-[132px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#37415115" strokeWidth="11" />
            {statuses.map((s) => {
              const frac = s.value / total;
              const pct = Math.round(frac * 100);
              const dash = frac * C;
              const isActive = hoveredStatus === null || hoveredStatus === s.key;
              const el = (
                <circle
                  key={s.key}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="11"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  pointerEvents="visibleStroke"
                  className="cursor-default transition-opacity"
                  style={{ opacity: isActive ? 1 : 0.35 }}
                  onMouseEnter={(event) =>
                    showSegmentTooltip(s.key, pct, s.value, event.clientX, event.clientY)
                  }
                  onMouseMove={moveSegmentTooltip}
                  onMouseLeave={hideSegmentTooltip}
                  onFocus={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    showSegmentTooltip(
                      s.key,
                      pct,
                      s.value,
                      rect.left + rect.width / 2,
                      rect.top,
                    );
                  }}
                  onBlur={hideSegmentTooltip}
                  tabIndex={0}
                  aria-label={`${s.key}: ${pct}%`}
                />
              );
              offset += dash;
              return el;
            })}
          </svg>
          {segmentTooltip
            ? createPortal(
                <span
                  role="tooltip"
                  style={{
                    position: "fixed",
                    top: segmentTooltip.y - 8,
                    left: segmentTooltip.x,
                    transform: "translate(-50%, -100%)",
                    zIndex: 50,
                  }}
                  className="pointer-events-none w-max whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-[11px] font-medium text-white shadow-pop animate-fade-in"
                >
                  {segmentTooltip.label}
                </span>,
                document.body,
              )
            : null}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-xl font-semibold leading-none text-zinc-700 dark:text-zinc-300">{payload.total}</span>
            <span className="mt-1 max-w-[72px] text-center text-[10px] leading-tight text-muted-foreground">
              Total Members
            </span>
          </div>
        </div>

        <ul className="flex min-w-0 flex-col justify-center gap-0.5">
          {statuses.map((s) => (
            <li
              key={s.key}
              className="flex items-center gap-1.5 rounded px-1.5 py-1 text-xs hover:bg-primary/[0.04]"
            >
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
              <span className="w-[52px] shrink-0 truncate text-zinc-700 dark:text-zinc-300">{s.key}</span>
              <span className="tabular shrink-0 font-medium text-muted">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-px shrink-0 self-stretch bg-border/60" />

      <div className="flex min-w-0 flex-[1.1] flex-col gap-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">Members by Platform</p>
        <div className="grid min-h-0 flex-1 grid-cols-3 content-center gap-1.5">
          {payload.devices.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between gap-1 rounded bg-muted/5 px-2 py-1.5"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <PlatformIcon name={d.name} />
                <span className="truncate text-[10px] text-muted-foreground">{d.name}</span>
              </span>
              <span className="tabular shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
