/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      colors: {
        // Design-system tokens (see src/index.css for CSS variables)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5d2bff",
          foreground: "#ffffff",
        },
        ink: {
          // Base dark background / text
          DEFAULT: "#110302",
        },
        muted: {
          // Muted text / borders / structural elements
          DEFAULT: "#374151",
          foreground: "#6b7280",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic — data health indicators ONLY
        health: {
          good: "#10b981", // emerald
          warn: "#f59e0b", // amber
          bad: "#ef4444", // red
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      spacing: {
        // 8px base grid helpers
        "grid-1": "8px",
        "grid-2": "16px",
        "grid-3": "24px",
        "grid-4": "32px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(17, 3, 2, 0.04), 0 1px 3px 0 rgba(17, 3, 2, 0.06)",
        "card-hover":
          "0 4px 12px -2px rgba(17, 3, 2, 0.10), 0 2px 6px -2px rgba(17, 3, 2, 0.08)",
        pop: "0 8px 30px -6px rgba(17, 3, 2, 0.18)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "draw-in": {
          from: { "stroke-dashoffset": "1000" },
          to: { "stroke-dashoffset": "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
