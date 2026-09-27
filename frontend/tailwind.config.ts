import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0d12",
        surface: {
          DEFAULT: "#11151c",
          elevated: "#161b24",
          highlight: "#1c2330",
        },
        border: {
          subtle: "#1e2634",
          medium: "#2a3547",
          strong: "#3b4a62",
        },
        nordic: {
          amber: "#f59e0b",
          amberMuted: "#b45309",
          amberGlow: "rgba(245, 158, 11, 0.12)",
          cyan: "#06b6d4",
          emerald: "#10b981",
          rose: "#f43f5e",
          slate: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
