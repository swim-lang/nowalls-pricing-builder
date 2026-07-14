import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "Arial", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft-xl": "0 24px 90px rgba(48, 38, 28, 0.12)",
      },
      animation: {
        "fade-up": "fadeUp 480ms ease-out both",
        "package-scroll": "packageScroll 72s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        packageScroll: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(calc(-50% - 0.375rem))" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
