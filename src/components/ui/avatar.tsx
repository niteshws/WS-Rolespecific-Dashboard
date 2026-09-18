import { cn } from "@/lib/utils";

/** Soft pastel bg + darker same-hue initials, matching product avatar style. */
const PALETTE = [
  { bg: "#ede9fe", fg: "#6d28d9" }, // lavender / purple
  { bg: "#fce7f3", fg: "#be185d" }, // pink / magenta
  { bg: "#ccfbf1", fg: "#0f766e" }, // teal
  { bg: "#ffedd5", fg: "#c2410c" }, // peach / orange
  { bg: "#d1fae5", fg: "#047857" }, // mint / green
  { bg: "#e0f2fe", fg: "#0369a1" }, // sky blue
  { bg: "#fef3c7", fg: "#b45309" }, // amber
  { bg: "#e0e7ff", fg: "#4338ca" }, // indigo
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({
  name,
  size = 28,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const tone = toneFor(name);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded font-semibold",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: tone.bg,
        color: tone.fg,
        fontSize: size * 0.36,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
