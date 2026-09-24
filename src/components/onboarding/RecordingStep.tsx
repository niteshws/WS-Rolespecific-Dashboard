import { useState } from "react";
import {
  Check,
  Download,
  Eye,
  EyeOff,
  Globe,
  Monitor,
  Shield,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DesktopTrackMode,
  RecordingPreferences,
  TrackerId,
  TrackerOption,
} from "@/types/onboarding";

const TRACKER_OPTIONS: TrackerOption[] = [
  {
    id: "desktop",
    title: "Desktop",
    badge: true,
    icon: "monitor",
    features: ["Automatic capture", "Full work insights", "Installed app"],
  },
  {
    id: "mobile",
    title: "Mobile",
    icon: "smartphone",
    features: ["Automatic capture", "GPS & job sites", "Installed app"],
  },
  {
    id: "web",
    title: "Web",
    icon: "globe",
    features: ["Manual timer", "Basic insights", "No installation"],
  },
];

const TRACKER_ICONS = {
  monitor: Monitor,
  smartphone: Smartphone,
  globe: Globe,
} as const;

type RecordingStepProps = {
  initial?: Partial<RecordingPreferences>;
  onChange?: (prefs: RecordingPreferences) => void;
  onValidationError?: (message: string) => void;
};

export const RecordingStep = ({ initial, onChange, onValidationError }: RecordingStepProps) => {
  const [captures, setCaptures] = useState<TrackerId[]>(initial?.captures ?? ["desktop"]);
  const [trackMode, setTrackMode] = useState<DesktopTrackMode>(initial?.trackMode ?? "visible");

  const hasDesktop: boolean = captures.includes("desktop");
  const hasMobile: boolean = captures.includes("mobile");
  const showDownload: boolean = (hasDesktop && trackMode === "visible") || hasMobile;
  const showSilentWarning: boolean = hasDesktop && trackMode === "silent";

  const emitChange = (nextCaptures: TrackerId[], nextMode: DesktopTrackMode): void => {
    onChange?.({ captures: nextCaptures, trackMode: nextMode });
  };

  const toggleTracker = (id: TrackerId): void => {
    try {
      const isSelected: boolean = captures.includes(id);

      if (isSelected && captures.length === 1) {
        onValidationError?.("Select at least one tracker.");
        return;
      }

      const nextCaptures: TrackerId[] = isSelected
        ? captures.filter((item) => item !== id)
        : [...captures, id];

      setCaptures(nextCaptures);
      emitChange(nextCaptures, trackMode);
    } catch (error) {
      console.error("Failed to toggle tracker:", error);
    }
  };

  const selectTrackMode = (mode: DesktopTrackMode): void => {
    try {
      setTrackMode(mode);
      emitChange(captures, mode);
    } catch (error) {
      console.error("Failed to update desktop track mode:", error);
    }
  };

  const handleDownload = (): void => {
    try {
      window.open("https://www.workstatus.io/downloads", "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open downloads page:", error);
    }
  };

  return (
    <div className="grid gap-[18px]">
      <div className="grid grid-cols-3 items-stretch gap-3 max-[720px]:grid-cols-1">
        {TRACKER_OPTIONS.map((option) => {
          const selected: boolean = captures.includes(option.id);
          const Icon = TRACKER_ICONS[option.icon];

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleTracker(option.id)}
              className={cn(
                "relative flex h-full min-h-0 flex-col gap-2 rounded-xl border bg-white px-3.5 pb-3 pt-3.5 text-left transition-all",
                selected
                  ? "border-primary shadow-[0_6px_18px_rgba(93,43,255,0.08)]"
                  : "border-border hover:border-[#cabeff]",
              )}
            >
              {option.badge ? (
                <span className="absolute -top-2 left-3 z-[2] rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-white shadow-[0_4px_10px_rgba(93,43,255,0.25)]">
                  Recommended
                </span>
              ) : null}

              <span
                className={cn(
                  "absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border box-border",
                  selected ? "border-primary bg-primary text-white" : "border-[#d1d5db] bg-white",
                )}
                aria-hidden="true"
              >
                {selected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
              </span>

              <div className={cn("flex items-center pr-7", option.badge ? "mt-2" : "mt-0.5")}>
                <span
                  className={cn(
                    "grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-transparent box-border",
                    selected
                      ? "border-primary/20 bg-[#f3efff] text-[#5d2bff]"
                      : "bg-[#f7f4ff] text-[#8b6cff]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <b className="text-sm font-bold leading-snug text-ink">{option.title}</b>

              <ul className="mt-auto grid gap-[5px]">
                {option.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "relative pl-3 text-xs leading-[1.35] text-muted-foreground before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:content-['']",
                      selected ? "before:bg-primary before:opacity-100" : "before:bg-current before:opacity-45",
                    )}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {hasDesktop ? (
        <div className="animate-fade-in grid gap-3 rounded-xl border border-border bg-white p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5d2bff]">
                Desktop experience
              </p>
              <h3 className="text-base font-bold tracking-[-0.02em] text-ink">
                How should Desktop run?
              </h3>
            </div>
            <span className="shrink-0 rounded-full bg-[#eef0f4] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Desktop only
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
            {(
              [
                {
                  mode: "visible" as DesktopTrackMode,
                  label: "Visible",
                  description: "Employees control the timer",
                  icon: Eye,
                },
                {
                  mode: "silent" as DesktopTrackMode,
                  label: "Silent",
                  description: "Runs on managed computers",
                  icon: EyeOff,
                },
              ] as const
            ).map(({ mode, label, description, icon: ModeIcon }) => {
              const selected: boolean = trackMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => selectTrackMode(mode)}
                  className={cn(
                    "relative flex min-h-0 items-start gap-2.5 rounded-[10px] border bg-white py-3 pl-3 pr-9 text-left transition-all",
                    selected ? "border-primary" : "border-border hover:border-[#cabeff]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute right-3 top-3 h-[18px] w-[18px] rounded-full border box-border",
                      selected
                        ? "border-primary shadow-[inset_0_0_0_4.5px_#5d2bff]"
                        : "border-[#d1d5db] bg-white",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-transparent box-border",
                      selected
                        ? "border-primary/20 bg-[#f3efff] text-[#5d2bff]"
                        : "bg-[#eef0f4] text-muted-foreground",
                    )}
                  >
                    <ModeIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <b className="block text-[13px] font-semibold text-ink">{label}</b>
                    <span className="mt-0.5 block text-[11.5px] leading-[1.35] text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {showSilentWarning ? (
            <div className="flex items-start gap-2 rounded-lg border border-[rgba(171,100,0,0.28)] bg-[#fff8e8] px-3 py-2.5 text-xs leading-[1.45] text-[#6b4a12]">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f59e0b]" />
              <span>
                Silent mode should only be used on company-managed devices with the disclosures
                required by your policy and local law.{" "}
                <a
                  href="https://support.workstatus.io/en/article/how-to-install-workstatus-mac-app-in-silent-mode-1f4zbiv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#5d2bff] underline underline-offset-2 hover:text-[#4d1fe0]"
                >
                  Read Silent mode setup docs
                </a>
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {showDownload ? (
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-md border border-border bg-[#eef0f4] text-xs font-semibold text-ink transition-colors hover:border-[#d1d5db] hover:bg-[#e4e7ec]"
        >
          <Download className="h-3.5 w-3.5" />
          Download apps
        </button>
      ) : null}
    </div>
  );
};
