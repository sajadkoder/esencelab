/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FDFCF8", // Sacred Ivory
        primary: "#0A0A0A", // Deep Obsidian
        secondary: "rgba(10,10,10,0.6)",
        accent: "#D4AF37", // Champagne Gold
        "accent-soft": "rgba(212,175,55,0.08)",
        border: "rgba(10,10,10,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        serif: ["var(--font-playfair-display)", "serif"],
      },
      backgroundImage: {
        'mesh-ivory': 'radial-gradient(at 40% 20%, hsla(43,40%,95%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(43,20%,97%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(43,30%,96%,1) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
