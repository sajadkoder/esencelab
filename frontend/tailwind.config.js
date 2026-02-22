import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F4EF",
        primary: "#0B0B0B",
        secondary: "rgba(0,0,0,0.6)",
        accent: "#2563EB",
        "accent-soft": "rgba(37,99,235,0.08)",
        border: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      transitionDuration: {
        '250': '250ms',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
};
export default config;
