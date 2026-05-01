/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ui: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          subtle: "var(--bg-subtle)",
        },
        brand: {
          primary: "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
        },
      },
      fontFamily: {
        display: ["Inter", "SF Pro Display", "SF Pro Text", "system-ui", "sans-serif"],
        body: ["Inter", "SF Pro Text", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
