export type TrackerId = "desktop" | "mobile" | "web";

export type DesktopTrackMode = "visible" | "silent";

export type RecordingPreferences = {
  captures: TrackerId[];
  trackMode: DesktopTrackMode;
};

export type TrackerOption = {
  id: TrackerId;
  title: string;
  badge?: boolean;
  icon: "monitor" | "smartphone" | "globe";
  features: string[];
};
